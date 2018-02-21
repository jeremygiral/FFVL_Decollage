FROM mongo
COPY decollages.json /tmp/decollages.json
CMD mongoimport --uri "mongodb://mongodb/ffvl-decollage" -c site --file ../../tmp/decollages.json --jsonArray
