from Bio.SeqUtils.ProtParam import ProteinAnalysis
import json
import sys

sequences = sys.argv[1].split(",")

pI = []
gravy = []

for seq in sequences:
    X = ProteinAnalysis(seq)
    pI.append(X.isoelectric_point())
    gravy.append(X.gravy())


load = {
    "pI": pI,
    "gravy": gravy
}

json_o = json.dumps(load)

# send back to node
print(json_o)
sys.stdout.flush()