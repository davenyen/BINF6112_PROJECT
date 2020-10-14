from Bio.PDB import PDBParser
from Bio.PDB.DSSP import DSSP
from Bio.PDB.DSSP import dssp_dict_from_pdb_file
import json

# p = PDBParser()
# structure = p.get_structure("3S7I", "./3s7i.pdb")
# model = structure[0]
# dssp = DSSP(model, "./3s7i.pdb", acc_array="Miller")

# print(dssp['A', (' ', 173, ' ')])

dssp_tup = dssp_dict_from_pdb_file('./3s7i.pdb')
dssp = dssp_tup[0]
# print(dssp_tup[0][('B', (' ', 576, ' '))])
# print(list(dssp.keys()))
# a_key = list(dssp.keys())[0]
# print(dssp)

# (dssp index, amino acid, secondary structure, relative ASA, phi, psi,
# NH_O_1_relidx, NH_O_1_energy, O_NH_1_relidx, O_NH_1_energy,
# NH_O_2_relidx, NH_O_2_energy, O_NH_2_relidx, O_NH_2_energy)
# ^ if using DSSP object, different to dssp_dict_from_pdb_file
# print(dssp[a_key])

# construct sequence from dssp output
sequence = ""
# sequenceA = ""
# sequenceB = ""
dssp_array = []
# accessible surface area
asa = []
# secondary structure
ss = []
for i in range(len(list(dssp.keys()))):
    key = list(dssp.keys())[i]
    sequence += dssp[key][0]
    # position in sequence from pdb
    dssp_array.append([dssp[key][0], dssp[key][1], dssp[key][2]])
    # if (key[0] == "A"):
    #     sequenceA += dssp[key][0]
    # else:
    #     sequenceB += dssp[key][0]
    asa.append(dssp[key][2])
    ss.append(dssp[key][1])


# print(sequence)
# print(sequenceA)
# print(sequenceB)
# print(sequenceA == sequenceB)
# print()
print(dssp[('A', (' ', 173, ' '))])
print(dssp[('B', (' ', 173, ' '))])

load = {
    "sequence": sequence,
    # "dssp": dssp_array
    "asa": asa,
    "ss": ss
}

json_o = json.dumps(load)
print(json_o)

with open("./dssp.json",'w') as f:
    f.write(json_o)