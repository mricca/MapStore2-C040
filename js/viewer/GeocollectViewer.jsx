const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropertiesViewer = require('./row/PropertiesViewer');
const RecordGrid = require('./row/RecordGrid');
const {Tabs, Tab} = require('react-bootstrap');
const moment = require('moment');

class GeocollectViewer extends React.Component {
    static propTypes = {
        response: PropTypes.object,
        wfsResponse: PropTypes.object,
        imgsResponse: PropTypes.object,
        layer: PropTypes.object,
        rowViewer: PropTypes.object
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.response !== this.props.response;
    }

    renderImg() {
        if (this.props.imgsResponse && this.props.imgsResponse.data && this.props.imgsResponse.data.data.length > 0) {
            return (
                <Tab eventKey={3} key={2} title={'Immagini'} >
                    <div className="catalog-results">
                            <RecordGrid key="records"
                                records={this.props.imgsResponse.data.data}
                            />
                    </div>
                </Tab>);
        }
        return null;
    }
    render() {
        const RowViewer = (this.props.layer && this.props.layer.rowViewer) || this.props.rowViewer || PropertiesViewer;
        let newResponse = this.props.wfsResponse;
        if (newResponse) {
            newResponse.features.push(this.props.response.features[0]);
            newResponse.features.reverse();
        } else {
            newResponse = {
                features: [this.props.response.features[0]]
            };
        }
        return (
            <Tabs id="geocollect-tab" bsStyle="tabs">
                {
                    (newResponse.features || []).map((feature, i) => {
                        if (feature.id.split('.')[0] === 'cens_muri') {
                            return (
                                <Tab eventKey={1} key={i} title="Segnalazione">
                                    <RowViewer key={i} title={'Segnalazione'} exclude={["bbox"]} {...feature.properties}/>
                                </Tab>
                            );
                        }
                        if (feature.id.split('.')[0] === 'cens_muri_sop') {
                            return (
                                <Tab eventKey={2} key={i} title={'Modifica del ' + moment(feature.properties.gc_created).format("DD-MM-YYYY, h:mm:ss a")} >
                                    <RowViewer key={i} title={'Sopralluogo'} exclude={["bbox"]} {...feature.properties}/>
                                </Tab>
                            );
                        }
                    })
                }
                {this.renderImg()}
            </Tabs>
        );
    }
}

module.exports = GeocollectViewer;
