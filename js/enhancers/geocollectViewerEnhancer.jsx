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
const featureProperty = "my_orig_id";

const oneCall = (response) => {

    return Rx.Observable.defer(function() {
        let baseUrl = "http://geocollect.geo-solutions.it/opensdi2-manager/mvc/fileManager/extJSbrowser";
        const folder = "/media/cens_muri/" + response.features[0].properties[featureProperty];
        baseUrl = baseUrl + '?action=get_filelist&folder=' + folder + "/" + response.features[0].id;
        return axios.get(baseUrl);
    }).map((data) => (
        {imgsResponse: data}
    ));

};

const twoCall = (response) => {
    const url = 'http://geocollect.geo-solutions.it/geoserver/it.geosolutions/ows';
    const gcid = response.features[0].properties.gcid;
    const myOrigId = response.features[0].properties.my_orig_id;

    if (myOrigId) {
        let baseUrl = "http://geocollect.geo-solutions.it/opensdi2-manager/mvc/fileManager/extJSbrowser";
        const folder = "/media/cens_muri/" + response.features[0].properties[featureProperty];
        baseUrl = baseUrl + '?action=get_filelist&folder=' + folder + "/" + response.features[0].id;
        return Rx.Observable.defer(() =>
            axios.get(baseUrl)
        ).map((imgsResponse) => (
            {imgsResponse}
        ));
    }

    const cqlFilter = "my_orig_id=" + gcid;

    const firstGet = Rx.Observable.defer(() =>
        WFSApi.getFeatureSimple(
            url,
            {
                maxFeatures: 1,
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
            let baseUrl = "http://geocollect.geo-solutions.it/opensdi2-manager/mvc/fileManager/extJSbrowser";
            const folder = "/media/cens_muri/" + wfsResponse.features[0].properties[featureProperty];
            baseUrl = baseUrl + '?action=get_filelist&folder=' + folder + "/" + wfsResponse.features[0].id;
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
            ({response}) => {
                const id = response.features[0].id;
                if (id.split('.')[0] === 'cens_muri') {
                    return twoCall(response);
                }
                if (id.split('.')[0] === 'cens_muri_sop') {
                    return oneCall(response);
                }

            });
module.exports = compose(
   withProps( () => ({
       dataStreamFactory
   })),
   propsStreamFactory
);
