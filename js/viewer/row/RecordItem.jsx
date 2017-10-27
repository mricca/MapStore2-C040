/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const PropTypes = require('prop-types');
const {Panel, Thumbnail} = require('react-bootstrap');
const {isObject} = require('lodash');
const moment = require('moment');

const defaultThumb = require('./img/default.jpg');

require("./RecordItem.css");

class RecordItem extends React.Component {
    static propTypes = {
        currentLocale: PropTypes.string,
        onZoomToExtent: PropTypes.func,
        record: PropTypes.object,
        style: PropTypes.object
    };

    static defaultProps = {
        currentLocale: 'en-US'
    };

    componentWillMount() {
        document.addEventListener('click', this.handleClick, false);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClick, false);
    }

    getTitle = (title) => {
        return isObject(title) ? title[this.props.currentLocale] || title.default : title || '';
    };

    renderThumb = (thumbURL, record) => {
        let thumbSrc = 'http://geocollect.geo-solutions.it/opensdi2-manager/mvc/fileManager/extJSbrowser?action=get_image&file=' + thumbURL || defaultThumb;
        return (
            <Thumbnail
                id="geocollect-thumb"
                className="thumb"
                target="_blank"
                href={thumbSrc}
                alt={record && this.getTitle(record.name)}
                src={thumbSrc}/>
        );

    };

    renderDescription = (record) => {
        return moment(record.mtime).format("dddd, MMMM Do YYYY, h:mm:ss a");
    };

    render() {
        let record = this.props.record;
        return (
            <Panel className="record-item" style={this.props.style}>
                {this.renderThumb(record && record.web_path, record)}
                <div>
                    <h4 className="truncateText">Label: {record && this.getTitle(record.name)}</h4>
                    <h4 className="truncateText">Size: {record && record.size / 1000} Kb</h4>
                    <h4 className="truncateText">Last Modified: {this.renderDescription(record)}</h4>
                </div>
            </Panel>
        );
    }
}

module.exports = RecordItem;
