/*
 * Wazuh app - Integrity monitoring table component
 * Copyright (C) 2015-2020 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { Component, Fragment } from 'react';
import {
  EuiTableRowCell,
  EuiTableRow,
  EuiTableHeader,
  EuiTableHeaderCell,
  EuiTableBody,
  EuiCodeBlock,
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiTable,
  EuiToolTip,
  EuiFlexGroup,
  EuiLink,
  EuiTab
} from '@elastic/eui';
import './discover.less';
import { EuiFlexItem } from '@elastic/eui';
import { EuiFlexGrid } from '@elastic/eui';
import { ApiRequest } from '../../../../react-services/api-request';



export class RowDetails extends Component {
  state: {
    selectedTabId: string,
    ruleData: Object
  };

  props!: {
    item: Object
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedTabId: "table",
      ruleData: {}
    }
  }

  propertiesToArray(obj) {
    const isObject = val =>
      typeof val === 'object' && !Array.isArray(val);

    const addDelimiter = (a, b) =>
      a ? `${a}.${b}` : b;

    const paths = (obj = {}, head = '') => {
      return Object.entries(obj)
        .reduce((product, [key, value]) => {
          let fullPath = addDelimiter(head, key)
          return isObject(value) ?
            product.concat(paths(value, fullPath))
            : product.concat(fullPath)
        }, []);
    }

    return paths(obj);
  }

  async componentDidMount() {
    const rulesDataResponse = await ApiRequest.request('GET', `/rules`, { q: `id=${this.props.item.rule.id}` });
    const ruleData = (rulesDataResponse.data || {}).data || {};
    this.setState({ ruleData })
  }


  getExtraDetails(item) {
    const syscheckPaths = this.propertiesToArray(item.syscheck);
    const table = syscheckPaths.map((item, idx) => {
      return (
        <>
          <EuiFlexItem>
            empty
          </EuiFlexItem>
          <EuiFlexItem>
            {item}
          </EuiFlexItem>
          <EuiFlexItem>
            value
          </EuiFlexItem>
        </>
      )
    })
    return (<EuiFlexGrid columns={3}>{table}</EuiFlexGrid>)
  }

  columns() {
    return [
      {
        field: 'timestamp',
        name: 'Time',
        sortable: true
      },
    ]
  }

  getChildFromPath(object, path) {
    const pathArray = path.split('.');
    var child = object[pathArray[0]];
    for (var i = 1; i < pathArray.length; i++) {
      child = child[pathArray[i]];
    }
    return child;
  }

  renderRows(syscheckPaths) {
    const columns = [
      {
        id: 'actions',
      },
      {
        id: 'key',
      },
      {
        id: 'value',
      }
    ];

    const rows = syscheckPaths.map((item, idx) => {
      const cells = columns.map((currentColumn, idx) => {
        var child = (<span></span>);
        if (currentColumn.id === 'actions') {
          child = (<span></span>);
        }
        if (currentColumn.id === 'key') {
          child = <span>{"syscheck." + item}</span>;
        }
        if (currentColumn.id === 'value') {
          child = <span>{"syscheck." + this.getChildFromPath(this.props.item.syscheck, item)}</span>;
        }
        return (
          <EuiTableRowCell
            key={currentColumn.id}
            textOnly={true}
            style={{ borderBottom: "none", borderTop: "none", lineHeight: 1.15 }}>
            {child}
          </EuiTableRowCell>
        );
      });

      return (
        <EuiTableRow
          key={item.file}>
          {cells}
        </EuiTableRow>
      );
    });
    if(!rows.length){
      return (<div>No syscheck data was found.</div>)
    }
    return rows;
  }

  renderHeaderCells() {
    const header = [];

    header.push(
      <EuiTableHeaderCell
        key="actions"
        width={40}>

      </EuiTableHeaderCell>
    )

    header.push(
      <EuiTableHeaderCell
        key="key"
        width={220}>

      </EuiTableHeaderCell>
    )

    header.push(
      <EuiTableHeaderCell
        key="value">

      </EuiTableHeaderCell>
    )
    return header;
  }

  getTable() {
    const syscheckPaths = this.propertiesToArray(this.props.item.syscheck);
    return (
      <div style={{height: 400, overflow: 'auto'}}>
        <EuiTable>
          <EuiTableHeader style={{ visibility: "collapse" }}>{this.renderHeaderCells()}</EuiTableHeader>
          <EuiTableBody>{this.renderRows(syscheckPaths)}</EuiTableBody>
        </EuiTable>

      </div>)
  }

  getJSON() {
    const str = JSON.stringify(this.props.item, null, 2);
    return (
      <div>
        <EuiCodeBlock
          language="json"
          fontSize="s"
          paddingSize="m"
          color="dark"
          overflowHeight={400}
          isCopyable>
          {str}
        </EuiCodeBlock>

      </div>
    )
  }

  /**
   * Render the basic information in a list
   * @param {Number} id
   * @param {Number} level
   * @param {String} file
   * @param {String} path
   */
  renderInfo(id, level, file, path) {
    return (
      <ul>
        <li key="id"><b>ID:</b>&nbsp;{id}</li>
        <EuiSpacer size="s" />
        <li key="level"><b>Level:</b>
          <EuiToolTip position="top" content={`Filter by this level: ${level}`}>
            <EuiLink onClick={async () => alert("TODO ")}>
              &nbsp;{level}
            </EuiLink>
          </EuiToolTip>
        </li>

        <EuiSpacer size="s" />
        <li key="file"><b>File:</b>
          <EuiToolTip position="top" content={`Filter by this file: ${file}`}>
            <EuiLink onClick={async () => alert("TODO ")}>
              &nbsp;{file}
            </EuiLink>
          </EuiToolTip>
        </li>
        <EuiSpacer size="s" />
        <li key="path"><b>Path:</b>
          <EuiToolTip position="top" content={`Filter by this path: ${path}`}>
            <EuiLink onClick={async () => alert("TODO ")}>
              &nbsp;{path}
            </EuiLink>
          </EuiToolTip>
        </li>

        <EuiSpacer size="s" />
      </ul>
    )
  }


  /**
  * Render a list with the details
* @param {Array} details
   */
  renderDetails(details) {
    const detailsToRender = [];
    Object.keys(details).forEach((key, inx) => {
      detailsToRender.push(
        <li key={key}><b>{key}:</b>&nbsp;{details[key] === '' ? 'true' : details[key]}</li>
      );
    });
    return (
      <ul style={{ lineHeight: 'initial' }}>
        {detailsToRender}
      </ul>
    )
  }

  /**
  * Render the groups
* @param {Array} groups
   */
  renderGroups(groups) {
    const listGroups = [];
    groups.forEach((group, index) => {
      listGroups.push(
        <span key={group}>
          <EuiLink onClick={async () => alert("TODO ")}>
            <EuiToolTip position="top" content={`Filter by this group: ${group}`}>
              <span>
                {group}
              </span>
            </EuiToolTip>
          </EuiLink>
          {(index < groups.length - 1) && ', '}
        </span>
      );
    });
    return (
      <ul>
        <li>
          {listGroups}
        </li>
      </ul>
    )
  }

  getRule() {
    const item = this.state.ruleData.items[0];
    const { id, level, file, path, groups, details } = item;
    return (
      <EuiFlexGroup  style={{height: 412, marginTop: 0}}>
        {/* General info */}
        <EuiFlexItem>
          <EuiPanel paddingSize="m">
            <EuiTitle size={'s'}>
              <h3>Information</h3>
            </EuiTitle>
            <EuiSpacer size="s" />
            {this.renderInfo(id, level, file, path)}
            {/* Groups */}
            <EuiSpacer size={'m'} />
            <EuiTitle size={'s'}>
              <h3>Groups</h3>
            </EuiTitle>
            <EuiSpacer size="s" />
            {this.renderGroups(groups)}
          </EuiPanel>
        </EuiFlexItem>
        {/* Details */}
        <EuiFlexItem>
          <EuiPanel paddingSize="m">
            <EuiTitle size={'s'}>
              <h3>Details</h3>
            </EuiTitle>
            <EuiSpacer size="s" />
            {this.renderDetails(details)}
          </EuiPanel>
        </EuiFlexItem>
        {/* Compliance  -- TODO -- */}
        { /*Object.keys(compliance).length > 0 && ( 
            <EuiFlexItem>
              <EuiPanel paddingSize="m">
                <EuiTitle size={'s'}>
                  <h3>Compliance</h3>
                </EuiTitle>
                <EuiSpacer size="s" />
                {this.renderCompliance(compliance)}
              </EuiPanel>
            </EuiFlexItem>
          ) */}
      </EuiFlexGroup>
    )
  }


  onSelectedTabChanged = id => {
    this.setState({
      selectedTabId: id,
    });
  };

  getTabs() {
    const tabs = [
      {
        id: 'table',
        name: 'Table',
        disabled: false,
      },
      {
        id: 'json',
        name: 'JSON',
        disabled: false,
      },
      {
        id: 'rule',
        name: 'Rule',
        disabled: false,
      }
    ];

    return tabs.map((tab, index) => (
      <EuiTab
        onClick={() => this.onSelectedTabChanged(tab.id)}
        isSelected={tab.id === this.state.selectedTabId}
        disabled={tab.disabled}
        key={index}>
        {tab.name}
      </EuiTab>
    ));
  }

  render() {

    return (
      <div>

        {this.getTabs()}
        <EuiFlexGroup>
          <EuiFlexItem>
            {this.state.selectedTabId === 'table' && (
              this.getTable()
            )}
            {this.state.selectedTabId === 'json' && (
              this.getJSON()
            )}
            {this.state.selectedTabId === 'rule' && this.state.ruleData.totalItems === 1 && (
              this.getRule()
            ) || this.state.selectedTabId === 'rule' &&
              (
                <span>There was an error loading rule ID: {this.props.item.rule.id}</span>
              )}
          </EuiFlexItem>

        </EuiFlexGroup>

      </div>
    );
  }
}