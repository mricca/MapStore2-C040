const STARTLOADING = "FEATURELOADER::STARTLOADING";
module.exports = {
    /**
     * start loading the features
     */
    startFeatureLoader: (params = {}) => ({
        type: STARTLOADING,
        layer: params.layer,
        cql_filter: params.cql_filter
    }),
    STARTLOADING
};
