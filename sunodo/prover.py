import json
import base64
import subprocess
import tempfile
import os


def hex2bytes(hex_str):
    if hex_str[:2] == '0x': hex_str = hex_str[2:]
    return bytes.fromhex(hex_str)

class Prover:
    def __init__(self, circuit_filepath, verbose=False, backend_path=None, base_filepath=None):
        self.circuit_filepath = circuit_filepath

        if backend_path is None:
            result = subprocess.run(['find','/','-name','backend_binary','-type','f,l'], capture_output=True, text=True)
            lines = result.stdout.splitlines()
            if len(lines) != 1:
                raise Exception("Can't determine Backend, please define path")

            backend_path = '/'.join(lines[0].split('/')[0:-1])

        if base_filepath is None:
            base_filepath = "./test"

        circuit_file = open(self.circuit_filepath)
        self.circuit = json.load(circuit_file)
        self.public_inputs = list(map(lambda y: y['name'],filter(lambda x: x['visibility'] == 'public' , self.circuit['abi']['parameters'])))

        self.verbose = '-v' if verbose else ''
        self.vk_filepath = f"{base_filepath}.vk"
        self.bytecode_filepath = f"{base_filepath}.bytecode"
        self.backend_binary_path = f"{backend_path}/backend_binary"
        self.crs_path = f"{backend_path}/crs"

        if not os.path.exists(self.backend_binary_path) or not os.path.exists(self.crs_path):
            raise Exception("Backend files not found")

    def export_bytecode(self):
        bc = base64.b64decode(self.circuit['bytecode'])
        bytecode_file = open(self.bytecode_filepath,'wb')

        bytecode_file.write(bc)
        bytecode_file.close()

    def write_vk(self):
        if not os.path.exists(self.bytecode_filepath):
            self.export_bytecode()

        result = subprocess.run([self.backend_binary_path,"write_vk",self.verbose,"-c",self.crs_path,"-b", \
            self.bytecode_filepath,"-o",self.vk_filepath],capture_output=True, text=True)
        if result.returncode != 0:
            raise Exception(f"Error writing vk: {result}")

    def prove(self, payload):
        if not os.path.exists(self.vk_filepath):
            self.write_vk()

        # proof_temp = tempfile.NamedTemporaryFile()
        # proof_file = proof_temp.file

        # for param in self.public_inputs:
        #     payload_param = proof_json.get(param)
        #     if payload_param is None:
        #         raise Exception("Parameter missing")
        #     if type(payload_param) == type(""):
        #         payload_param = [payload_param]
        #     param_bytes_list = [hex2bytes(i) for i in payload_param]
        #     for b in param_bytes_list: proof_file.write(b)

        # proof = hex2bytes(proof_json['proof'])

        # proof_file.write(proof)
        # proof_file.flush()

        result = subprocess.run([self.backend_binary_path,"prove",self.verbose,"-c",self.crs_path,"-k",self.vk_filepath, \
            "-p",proof_temp.name],capture_output=True, text=True)

        if self.verbose: print(f"Prove return: {result.stderr}")

        proof_temp.close()
        return result.returncode == 0


    def verify(self, proof_json):
        if not os.path.exists(self.vk_filepath):
            self.write_vk()

        proof_temp = tempfile.NamedTemporaryFile()
        proof_file = proof_temp.file

        for param in self.public_inputs:
            payload_param = proof_json.get(param)
            if payload_param is None:
                raise Exception("Parameter missing")
            if type(payload_param) == type(""):
                payload_param = [payload_param]
            param_bytes_list = [hex2bytes(i) for i in payload_param]
            for b in param_bytes_list: proof_file.write(b)

        proof = hex2bytes(proof_json['proof'])

        proof_file.write(proof)
        proof_file.flush()

        result = subprocess.run([self.backend_binary_path,"verify",self.verbose,"-c",self.crs_path,"-k",self.vk_filepath, \
            "-p",proof_temp.name],capture_output=True, text=True)

        if self.verbose: print(f"Verify return: {result.stderr}")

        proof_temp.close()
        return result.returncode == 0


if __name__ == '__main__':
    import sys,getopt
    opts, args = getopt.getopt(sys.argv[1:],"hvc:p:b:t:",["help","verbose","circuit=","proof=","backend_path=","target_path=","write_vk","verify","prove"])
    proof = None
    circuit = None
    backend_path = None
    target_path = None
    action = None
    verbose = False
    for opt, arg in opts:
        if opt in ('-h','--help'):
            print(f"Usage:")
            print(f"  {sys.argv[0]} <command> <circuit> [options]")
            sys.exit()
        elif opt in ("--write_vk", "--verify", "--prove"):
            action = opt[2:]
        elif opt in ("-c", "--circuit"):
            circuit = arg
        elif opt in ("-p", "--proof"):
            proof = json.loads(arg)
        elif opt in ("-t", "--target_path"):
            target_path = arg
        elif opt in ("-b", "--backend_path"):
            backend_path = arg
        elif opt in ("-v", "--verbose"):
            verbose = True

    if circuit is None :
        print(f"Missing circuit")
        sys.exit(1)

    v = Prover(circuit_filepath=circuit, verbose=verbose, backend_path=backend_path, base_filepath=target_path)
    if action == 'write_vk':
        v.write_vk()
    elif action == 'verify':
        if proof is None:
            print(f"Missing proof")
            sys.exit(1)
        print(f"Verification: {v.verify(proof)}")
    elif action == 'prove':
        if proof is None:
            print(f"Missing payload")
            sys.exit(1)
        print(f"Verification: {v.prove(proof)}")
    else:
        print(f"Missing action")
        sys.exit(1)

    sys.exit()