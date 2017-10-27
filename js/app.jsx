/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const {startLoading, updateFeatureLoader} = require('./epics/featureloader');
const LocaleUtils = require('../MapStore2/web/client/utils/LocaleUtils');
const {addCustomEditors, addCustomViewer} = require('./epics/initCustomEditors');

const startApp = () => {
    const StandardApp = require('../MapStore2/web/client/components/app/StandardApp');
    const {pages, pluginsDef, initialState, storeOpts, printingEnabled} = require('./appConfig');
    const routerSelector = createSelector(state => state.locale, (locale) => ({
        locale: locale || {},
        themeCfg: {
            theme: "comge"
        },
        pages
    }));
    const StandardRouter = connect(routerSelector)(require('../MapStore2/web/client/components/app/StandardRouter'));
    const appStore = require('../MapStore2/web/client/stores/StandardStore').bind(null, initialState, {
        maps: require('../MapStore2/web/client/reducers/maps'),
        security: require('../MapStore2/web/client/reducers/security')
    }, {
        "FEATUREVIEWER:startLoading": startLoading,
        "FEATUREVIEWER:updateFeatureLoader": updateFeatureLoader,
        addCustomEditors,
        addCustomViewer
    });
    const appConfig = {
        appStore,
        storeOpts,
        pluginsDef,
        initialActions: [],
        appComponent: StandardRouter,
        printingEnabled
    };
    ReactDOM.render(
        <StandardApp {...appConfig}/>,
        document.getElementById('container')
    );
};
if (!global.Intl ) {
    // Ensure Intl is loaded, then call the given callback
    LocaleUtils.ensureIntl(startApp);
}else {
    startApp();
}
