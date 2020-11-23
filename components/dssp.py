from Bio.PDB import PDBParser
from Bio.PDB.DSSP import DSSP
from Bio.PDB.DSSP import dssp_dict_from_pdb_file
import json
import sys

# p = PDBParser()
# structure = p.get_structure("3S7I", "./3s7i.pdb")
# model = structure[0]
# dssp = DSSP(model, "./3s7i.pdb", acc_array="Miller")

# print(dssp['A', (' ', 173, ' ')])
pdbFile = sys.argv[1]

dssp_tup = dssp_dict_from_pdb_file(pdbFile, DSSP="#!/bin/sh\n./mkdssp")
dssp = dssp_tup[0]

# (dssp index, amino acid, secondary structure, relative ASA, phi, psi,
# NH_O_1_relidx, NH_O_1_energy, O_NH_1_relidx, O_NH_1_energy,
# NH_O_2_relidx, NH_O_2_energy, O_NH_2_relidx, O_NH_2_energy)
# ^ if using DSSP object, different to dssp_dict_from_pdb_file

# construct sequence from dssp output
sequence = ""
dssp_array = []
# accessible surface area
asa = []
# secondary structure
ss = []
# residue ids
res_id = []
for i in range(len(list(dssp.keys()))):
    key = list(dssp.keys())[i]
    sequence += dssp[key][0]
    asa.append(dssp[key][2])
    ss.append(dssp[key][1])
    res_id.append(key[1][1])


load = {
    "sequence": sequence,
    # "dssp": dssp_array
    "asa": asa,
    "ss": ss,
    "res_id": res_id
}

json_o = json.dumps(load)

# send back to node
print(json_o)
sys.stdout.flush()