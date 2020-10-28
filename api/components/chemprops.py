from Bio.SeqUtils.ProtParam import ProteinAnalysis
import json
import sys

seq = sys.argv[1]

X = ProteinAnalysis(seq)

load = {
    "pI": X.isoelectric_point(),
    "gravy": X.gravy()
}

json_o = json.dumps(load)

# send back to node
print(json_o)
sys.stdout.flush()