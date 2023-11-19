from os import environ
import logging
import requests
import json

from prover import Prover

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")

zk_prover = Prover(
    circuit_filepath='circuit.json',
    verbose=False,
    backend_path='/opt/backend',
    base_filepath='circuit',
)


def handle_advance(data):
    logger.info(f"Received advance request data {data}")

    try:
        payload_json = json.loads(hex2str(data["payload"]))
        result = zk_prover.prove(payload_json)
        logger.info(f"ZK Prove: {result}")
    except Exception as e:
        logger.error(e)
        return "reject"

    return "accept"


def handle_inspect(data):
    logger.info(f"Received inspect request data {data}")

    try:
        payload_json = json.loads(hex2str(data["payload"]))
        result = zk_prover.prove(payload_json)
        logger.info(f"ZK Prove: {result}")
    except Exception as e:
        logger.error(e)
        return "reject"

    return "accept"


handlers = {
    "advance_state": handle_advance,
    "inspect_state": handle_inspect,
}

finish = {"status": "accept"}

while True:
    logger.info("Sending finish")
    response = requests.post(rollup_server + "/finish", json=finish)
    logger.info(f"Received finish status {response.status_code}")
    if response.status_code == 202:
        logger.info("No pending rollup request, trying again")
    else:
        rollup_request = response.json()
        data = rollup_request["data"]
        handler = handlers[rollup_request["request_type"]]
        finish["status"] = handler(rollup_request["data"])
