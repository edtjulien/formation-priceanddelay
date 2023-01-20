import json
import warnings
from enum import Enum
from typing import List

import mlflow
import numpy as np
import pandas as pd
import plotly.express as px
import utils
from config import ML_FLOW_MODEL_ID, ML_FLOW_URL
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from scipy import stats

warnings.filterwarnings("ignore")

# uvicorn api:app --host 0.0.0.0
# uvicorn api:app --reload --host 0.0.0.0 --port 8081

tags_metadata = [
    {
        "name": "prices",
        "description": "Take descriptive data of vehicules as input and return predictions of daily rental price in euros for each.",
    },
    {
        "name": "delay",
        "description": "Chart and data representation for delay of checkout analysis.",
    },
]

app = FastAPI(
    title="Get Around Unofficial API",
    description="Unofficial API with machine learning based of Get Around test data",
    version="0.1",
    contact={"name": "Julien"},
    openapi_tags=tags_metadata,
)

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mlflow.set_tracking_uri(ML_FLOW_URL)
model = mlflow.pyfunc.load_model(f"runs:/{ML_FLOW_MODEL_ID}/best_estimator")

df_delays = pd.read_excel("../get_around_delay_analysis.xlsx")
df_prices = pd.read_csv("../get_around_pricing_project.csv", index_col=[0])


class ItemCar(BaseModel):
    model_key: str = Field(example="Citroën")
    mileage: int = Field(example=140411)
    engine_power: int = Field(example=100)
    fuel: str = Field(example="diesel")
    paint_color: str = Field(example="black")
    car_type: str = Field(example="convertible")
    private_parking_available: bool = Field(example=False)
    has_gps: bool = Field(example=True)
    has_air_conditioning: bool = Field(example=True)
    automatic_car: bool = Field(example=False)
    has_getaround_connect: bool = Field(example=False)
    has_speed_regulator: bool = Field(example=False)
    winter_tires: bool = Field(example=True)


class PredictInput(BaseModel):
    inputs: List[ItemCar]


class PredictOutput(BaseModel):
    predictions: List[float] = Field(example=[98.47384])


@app.post(
    "/prices/predict",
    tags=["prices"],
    response_model=PredictOutput,
    description="Get the prices prediction regarding information of cars.",
)
async def prices_predict(inputs: PredictInput):
    data = inputs.dict()["inputs"]

    df_data = pd.DataFrame.from_records(data)

    predictions = model.predict(df_data)

    return {"predictions": list(predictions)}


@app.get(
    "/prices/categories",
    tags=["prices"],
    description="Get the list of possible value for categorical data.",
)
async def prices_categories():
    with open("valid_categories.json") as file:
        cats = json.load(file)
        return cats


@app.get("/prices/list", tags=["prices"], description="Get the prices dataset.")
async def prices_list():
    json_str = json.dumps(df_prices.fillna("").to_dict(), default=utils.default_dumps)
    return Response(content=json_str, media_type="application/json")


@app.get(
    "/prices/schema",
    tags=["prices"],
    description="Get the schema of the input format of the input for the model.",
)
async def prices_schema():
    return Response(content=ItemCar.schema_json(), media_type="application/json")


class ChartEnum(Enum):
    STATE = "state"
    CHECKIN_TYPE = "checkin_type"
    RENTAL_NB = "rental_nb"
    TIME_DELTA = "time_delta"
    DELAY_CHECKOUT = "delay_checkout"


@app.get(
    "/delay/plotlychart", tags=["delay"], description="Get plotly json format chart."
)
async def delay_plotlychart(typec: ChartEnum):
    fig = None
    if typec == ChartEnum.STATE:  # Part of ended and cancelled rental
        fig = px.pie(df_delays, names="state")

    elif typec == ChartEnum.CHECKIN_TYPE:  # Part of mobile and connect checkin
        fig = px.pie(df_delays, names="checkin_type")

    elif typec == ChartEnum.RENTAL_NB:  # Distribution of rental number for one car
        df_rental_bycar = (
            df_delays.groupby("car_id")
            .agg({"rental_id": "count"})
            .sort_values("rental_id", ascending=False)
        )
        df_rental_bycar = df_rental_bycar.rename({"rental_id": "rental_nb"}, axis=1)
        fig = px.histogram(df_rental_bycar, x="rental_nb", nbins=50)

    elif typec == ChartEnum.DELAY_CHECKOUT:  # Distribution of delays
        # drop of outliers for delay (no need for delta)
        df_zscore = stats.zscore(a=df_delays.loc[:, "delay_checkout"])

        fig = px.histogram(
            df_delays[np.abs(df_zscore) < 2],
            x="delay_at_checkout_in_minutes",
        )

    elif typec == ChartEnum.DELAY_CHECKOUT:  # Distribution of delta
        fig = px.histogram(
            df_delays,
            x="time_delta_with_previous_rental_in_minutes",
            nbins=30,
        )

    if fig is not None:
        json_str = json.dumps(fig.to_dict(), default=utils.default_dumps)
        return Response(content=json_str, media_type="application/json")

    return None


@app.get(
    "/delay/list",
    tags=["delay"],
    description="Get the delay of checkout and delta with previous rental dataset.",
)
async def delay_list():
    json_str = json.dumps(df_delays.fillna("").to_dict(), default=utils.default_dumps)
    return Response(content=json_str, media_type="application/json")


class DelayOptimOutput(BaseModel):
    no_course_percentage: float = Field(example="21.78")
    saved_course_percentage: float = Field(example="30.69")
    no_saved_course_percentage: float = Field(example="26.66")


@app.get(
    "/delay/optim",
    tags=["delay"],
    description="Get the data of impact of timing delay in min between contractual checkout and next car availability for rental.",
    response_model=DelayOptimOutput,
)
async def delay_optim(timing: int = 59):
    df_delays_temp = df_delays.rename(
        {
            "delay_at_checkout_in_minutes": "delay_checkout",
            "previous_ended_rental_id": "previous_rental_id",
            "time_delta_with_previous_rental_in_minutes": "delta_previous",
        },
        axis=1,
    ).copy()

    df_delay_temp = df_delays_temp.dropna(subset=["delay_checkout"])
    df_delta_temp = df_delays_temp.dropna(subset=["delta_previous"])

    # drop of outliers for delay (no need for delta)
    df_zscore = stats.zscore(a=df_delay_temp.loc[:, "delay_checkout"])
    df_delay_temp = df_delay_temp[np.abs(df_zscore) < 2]

    total_course_delay = df_delay_temp.shape[0]
    total_course_delta = df_delta_temp.shape[0]
    no_course = df_delta_temp.query("delta_previous < @timing").shape[0]
    saved_course = df_delay_temp.query(
        "(delay_checkout <= @timing) & (delay_checkout > 0)"
    ).shape[0]

    not_saved = df_delay_temp.query("(delay_checkout > @timing)").shape[0]

    return {
        "no_course_percentage": round(no_course / total_course_delta * 100, 2),
        "saved_course_percentage": round(saved_course / total_course_delay * 100, 2),
        "no_saved_course_percentage": round(not_saved / total_course_delay * 100, 2),
    }
