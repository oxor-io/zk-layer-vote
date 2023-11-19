# syntax=docker.io/docker/dockerfile:1.4
FROM ubuntu:23.04 as builder

RUN <<EOF
apt update
apt install -y --no-install-recommends \
    build-essential=12.9ubuntu3 \
    ca-certificates=20230311ubuntu0.23.04.1 \
    g++-riscv64-linux-gnu=4:12.2.0-5ubuntu1 \
    wget=1.21.3-1ubuntu1 curl=7.88.1-8ubuntu2.3 \
    cmake=3.25.1-1ubuntu1 git=1:2.39.2-1ubuntu1.1 \
    ninja-build=1.11.1-1
EOF

WORKDIR /opt/build

ARG BARRETENBERG_BACK_VERSION=0.13.1
RUN wget https://github.com/AztecProtocol/aztec-packages/archive/refs/tags/barretenberg-v${BARRETENBERG_BACK_VERSION}.tar.gz && \
    tar zxvf /opt/build/barretenberg-v${BARRETENBERG_BACK_VERSION}.tar.gz

COPY riscv_cmake.patch .
RUN cd /opt/build/aztec-packages-barretenberg-v${BARRETENBERG_BACK_VERSION} && patch -p1 < ../riscv_cmake.patch

WORKDIR /opt/build/aztec-packages-barretenberg-v${BARRETENBERG_BACK_VERSION}/barretenberg/cpp/
RUN <<EOF
cmake --preset riscv64 -DCMAKE_BUILD_TYPE=Release -DFUZZING=OFF -DBENCHMARKS=OFF -DTESTING=OFF
cmake --build --preset riscv64 --target bb
EOF

RUN <<EOF
cmake --preset gcc -DCMAKE_BUILD_TYPE=Release -DFUZZING=OFF -DBENCHMARKS=OFF -DTESTING=OFF
cmake --build --preset gcc --target bb
EOF

RUN <<EOF
mkdir -p /root/.nargo/backends/bb-local
cp /opt/build/aztec-packages-barretenberg-v${BARRETENBERG_BACK_VERSION}/barretenberg/cpp/build/bin/* /root/.nargo/backends/bb-local/.
ln -sr /root/.nargo/backends/bb-local/bb /root/.nargo/backends/bb-local/backend_binary
EOF

ARG NARGO_VERSION=0.19.2
ENV NARGO_PATH=/opt/nargo
RUN <<EOF
mkdir -p $NARGO_PATH/bin
curl -o $NARGO_PATH/bin/nargo-x86_64-unknown-linux-gnu.tar.gz -L https://github.com/noir-lang/noir/releases/download/v${NARGO_VERSION}/nargo-x86_64-unknown-linux-gnu.tar.gz
tar -xvf $NARGO_PATH/bin/nargo-x86_64-unknown-linux-gnu.tar.gz -C $NARGO_PATH/bin/
EOF

ENV BACKEND_PATH /root/.nargo/backends/bb-local/
RUN <<EOF
mkdir ${BACKEND_PATH}/crs

url=https://aztec-ignition.s3.amazonaws.com/MAIN%20IGNITION/monomial/transcript00.dat

echo -n 32769 > ${BACKEND_PATH}/crs/size

start=28
end=$(( start + $(cat ${BACKEND_PATH}/crs/size) * 64 - 1 ))
curl -s -H "Range: bytes=${start}-${end}" ${url} -o ${BACKEND_PATH}/crs/g1.dat

start=$((28 + 5040001 * 64))
end=$(($start + 128 - 1))
curl -s -H "Range: bytes=${start}-${end}" ${url} -o ${BACKEND_PATH}/crs/g2.dat
EOF

COPY circuit /opt/circuit/.
WORKDIR /opt/circuit
RUN $NARGO_PATH/bin/nargo backend use bb-local
RUN $NARGO_PATH/bin/nargo compile
# RUN $NARGO_PATH/bin/nargo prove

###
# Final image
FROM --platform=linux/riscv64 cartesi/python:3.10-slim-jammy

LABEL io.sunodo.sdk_version=0.2.0
LABEL io.cartesi.rollups.ram_size=128Mi

ARG MACHINE_EMULATOR_TOOLS_VERSION=0.12.0
RUN <<EOF
apt-get update
apt-get install -y --no-install-recommends busybox-static=1:1.30.1-7ubuntu3 ca-certificates=20230311ubuntu0.22.04.1 curl=7.81.0-1ubuntu1.14
curl -fsSL https://github.com/cartesi/machine-emulator-tools/releases/download/v${MACHINE_EMULATOR_TOOLS_VERSION}/machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.tar.gz \
  | tar -C / --overwrite -xvzf -
rm -rf /var/lib/apt/lists/*
EOF

ENV PATH="/opt/cartesi/bin:${PATH}"

WORKDIR /opt/cartesi/dapp

COPY ./requirements.txt .
RUN pip install -r requirements.txt --no-cache

ARG BARRETENBERG_BACK_VERSION=0.13.1
ENV BACKEND_PATH=/opt/backend
COPY --from=builder /opt/build/aztec-packages-barretenberg-v${BARRETENBERG_BACK_VERSION}/barretenberg/cpp/build-riscv/bin ${BACKEND_PATH}
RUN ln -sr ${BACKEND_PATH}/bb ${BACKEND_PATH}/backend_binary
COPY --from=builder /root/.nargo/backends/bb-local/crs ${BACKEND_PATH}/crs

COPY --from=builder /opt/circuit/target/circuit.json .
# COPY --from=builder /opt/circuit/proofs/circuit.proof .

COPY prover.py .

RUN python prover.py --write_vk -v -c circuit.json -b ${BACKEND_PATH} -t circuit

RUN rm requirements.txt \
    && find /usr/local/lib -type d -name __pycache__ -exec rm -r {} + \
    && find /var/log \( -name '*.log' -o -name '*.log.*' \) -exec truncate -s 0 {} \;

COPY ./dapp.py .

ENV ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004"

ENTRYPOINT ["rollup-init"]
CMD ["python3", "dapp.py"]