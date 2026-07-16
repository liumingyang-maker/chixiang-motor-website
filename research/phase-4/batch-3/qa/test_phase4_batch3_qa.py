import importlib.util
from pathlib import Path

path=Path(__file__).with_name('phase4_batch3_qa.py')
spec=importlib.util.spec_from_file_location('qa',path); qa=importlib.util.module_from_spec(spec); spec.loader.exec_module(qa)
assert qa.demand_below('6',10) is True
assert qa.demand_below('10',10) is False
print('PASS | Regression: string engine-demand values are converted before threshold comparison')
