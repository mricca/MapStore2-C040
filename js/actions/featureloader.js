const STARTLOADING = "FEATURELOADER::STARTLOADING";
const UPDATE = "FEATURELOADER::UPDATE";
module.exports = {
    /**
     * start loading the features
     */
    startFeatureLoader: (params = {}) => ({
        type: STARTLOADING,
        layer: params.layer,
        cql_filter: params.cql_filter
    }),
    updateFeatureLoader: (oldParams = {}, params = {}) => ({
        type: UPDATE,
        layer: params.layer,
        cql_filter: params.cql_filter,
        oldParams
    }),
    STARTLOADING,
    UPDATE
};
