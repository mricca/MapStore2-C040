/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const {compose, withProps} = require('recompose');
const propsStreamFactory = require('../../MapStore2/web/client/components/misc/enhancers/propsStreamFactory');
const axios = require('../../MapStore2/web/client/libs/ajax');
const WFSApi = require('../../MapStore2/web/client/api/WFS');

const oneCall = (response, viewerConfig) => {
    return Rx.Observable.defer(function() {
        let baseUrl = viewerConfig.baseUrl;
        const folder = viewerConfig.folder + response.features[0].properties[viewerConfig.featureProperty];
        baseUrl = baseUrl + folder + "/" + response.features[0].id;
        return axios.get(baseUrl);
    }).map((data) => (
        {imgsResponse: data}
    ));
};

const twoCall = (response, viewerConfig) => {
    const url = viewerConfig.wfsUrl;
    const gcid = response.features[0].properties.gcid;
    const myOrigId = response.features[0].properties.my_orig_id;

    if (myOrigId) {
        let baseUrl = viewerConfig.baseUrl;
        const folder = viewerConfig.folder + response.features[0].properties[viewerConfig.featureProperty];
        baseUrl = baseUrl + folder + "/" + response.features[0].id;
        return Rx.Observable.defer(() =>
            axios.get(baseUrl)
        ).map((imgsResponse) => (
            {imgsResponse}
        ));
    }

    const cqlFilter = viewerConfig.featureProperty + "=" + gcid;

    const firstGet = Rx.Observable.defer(() =>
        WFSApi.getFeatureSimple(
            url,
            {
                typeName: 'cens_muri_sop',
                cql_filter: cqlFilter
            }
        )
    );

    const firstRes = firstGet.map((wfsResponse) => (
        wfsResponse
    ));

    const secondGet = firstRes.flatMap(function(wfsResponse) {
        if (wfsResponse.features.length > 0) {
            let baseUrl = viewerConfig.baseUrl;
            const folder = viewerConfig.folder + wfsResponse.features[0].properties[viewerConfig.featureProperty];
            baseUrl = baseUrl + folder + "/" + wfsResponse.features[0].id;
            return axios.get(baseUrl);
        }
        return Rx.Observable.of({});
    });

    const secondRes = secondGet.map((imgsResponse) => (
        imgsResponse
    ));

    return secondRes.zip(firstRes, function(imgsResponse, wfsResponse) {
        return {
            imgsResponse,
            wfsResponse
        };
    });
};

const dataStreamFactory = ($props) =>
    $props
        .switchMap(
            ({response, layer}) => {
                const id = response.features[0].id;
                const viewerConfig = layer.viewer;

                if (id.split('.')[0] === 'cens_muri') {
                    return twoCall(response, viewerConfig);
                }
                if (id.split('.')[0] === 'cens_muri_sop') {
                    return oneCall(response, viewerConfig);
                }
            });

module.exports = compose(
   withProps( () => ({
       dataStreamFactory
   })),
   propsStreamFactory
);
