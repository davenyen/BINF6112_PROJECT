from Bio.SeqUtils.ProtParam import ProteinAnalysis
import json
import sys

sequences = sys.argv[1].split(",")

pI = []
gravy = []

for seq in sequences:
    # replace ambiguous codes to avoid key errors
    seq = seq.replace("X", "S") # most abundant
    seq = seq.replace("B", "N")
    seq = seq.replace("Z", "Q")
    seq = seq.replace("J", "L")
    
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