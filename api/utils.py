import numpy as np


def default_dumps(o):
    if isinstance(o, np.ndarray):
        return o.tolist()
    return o
