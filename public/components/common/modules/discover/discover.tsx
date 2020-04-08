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

import React, { Component } from 'react';
import {
  EuiBasicTable,
  EuiLoadingSpinner,
  EuiSuperDatePicker,
  OnTimeChangeProps
} from '@elastic/eui';
import './discover.less';
import { EuiFlexGroup } from '@elastic/eui';
import { EuiFlexItem } from '@elastic/eui';
import { GenericRequest } from '../../../../react-services/generic-request';
import { RowDetails } from './row-details';
import {  getServices } from 'plugins/kibana/discover/kibana_services';
import { WzSearchBar } from '../../../../components/wz-search-bar';
interface IDiscoverTime { from:string, to:string };



export class Discover extends Component {
  commonDurationRanges = [
    {"start":"now/d","end":"now/d","label":"Today"},
    {"start":"now/w","end":"now/w","label":"This week"},
    {"start":"now-15m","end":"now","label":"Last 15 minutes"},
    {"start":"now-30m","end":"now","label":"Last 30 minutes"},
    {"start":"now-1h","end":"now","label":"Last 1 hour"},
    {"start":"now-24h","end":"now","label":"Last 24 hours"},
    {"start":"now-7d","end":"now","label":"Last 7 days"},
    {"start":"now-30d","end":"now","label":"Last 30 days"},
    {"start":"now-90d","end":"now","label":"Last 90 days"},
    {"start":"now-1y","end":"now","label":"Last 1 year"},
  ]

  timefilter: {
    getTime(): IDiscoverTime
    setTime(time:IDiscoverTime): void
    _history: {history:{items:{from:string, to:string}[]}}
  };
  
  state: {
    filters: Array<Object>,
    sort: Object,
    alerts: Array<Object>,
    total: Number,
    pageIndex: Number,
    pageSize: Number,
    sortField: string,
    sortDirection: string,
    isLoading: boolean,
    requestFilters: Object,
    requestSize: Number
    requestOffset: Number
    itemIdToExpandedRowMap: Object,
    TimeFilter: Object,
    datePicker: OnTimeChangeProps,
  };

  props!: {
    filters: Array<Object>
  }

  constructor(props) {
    super(props);
    this.timefilter = getServices().timefilter;
    const { from, to } = this.timefilter.getTime();

    this.state = {
      TimeFilter: {},
      filters: [],
      sort: {},
      alerts: [],
      total: 0,
      pageIndex: 0,
      pageSize: 10,
      sortField: 'timestamp',
      sortDirection: 'asc',
      isLoading: false,
      requestFilters: {},
      requestSize: 500,
      requestOffset: 0,
      itemIdToExpandedRowMap: {},
      datePicker: {
        start: from, 
        end: to,
        isQuickSelection: true,
        isInvalid: false,
      },
    }

    this.onTimeChange.bind(this);
  }

  async componentDidMount() {
    try{
      const { timefilter } = getServices();
      this.setState({TimeFilter: timefilter, filters: this.props.filters});
    }catch(err){
      console.log(err);
    }
  }

  async componentDidUpdate() {
    try{
      await this.getAlerts();
    }catch(err){
      console.log(err);
    }
  }

  filtersAsArray(filters){
    const keys = Object.keys(filters);
    const result = [];
    for(var i=0; i<keys.length; i++){
      const item = {};
      item[keys[i]] = filters[keys[i]];
      result.push(item);
    }
    return result;
  }

  onFiltersChange = (filters) => {
    this.setState({filters: this.filtersAsArray(filters)});
  }

  toggleDetails = item => {
    const itemIdToExpandedRowMap = { ...this.state.itemIdToExpandedRowMap };
    if (itemIdToExpandedRowMap[item._id]) {
      delete itemIdToExpandedRowMap[item._id];
      this.setState({ itemIdToExpandedRowMap });
    } else {
      const newItemIdToExpandedRowMap = {};
      newItemIdToExpandedRowMap[item._id] = (
        (<div style={{width: "100%"}}> <RowDetails item={item}/></div>)
      );
      this.setState({ itemIdToExpandedRowMap:newItemIdToExpandedRowMap });
    }
  };

  buildFilter(){
    const filters = this.state.filters;
    const sort = {};
    if(this.state.sortField){
      sort[this.state.sortField] = {"order" : this.state.sortDirection};
    }
    const offset = Math.floor( (this.state.pageIndex * this.state.pageSize) / this.state.requestSize ) * this.state.requestSize;
    const timeFilter = { from : this.state.datePicker.start, to: this.state.datePicker.end};

   return {filters: filters, sort, ...timeFilter, offset};
  }

  async getAlerts() {
    //compare filters so we only make a request into Elasticsearch if needed
    const newFilters = this.buildFilter();
    if(JSON.stringify(newFilters) !== JSON.stringify(this.state.requestFilters) && !this.state.isLoading){
      this.setState({ isLoading: true})
      const alerts = await GenericRequest.request(
        'POST',
        `/elastic/alerts`,
        newFilters
      );

      this.setState({alerts: alerts.data.alerts, total: alerts.data.hits, isLoading: false, requestFilters: newFilters, filters:newFilters.filters})
    }
  }

  columns() {
    return [
      {
        field: 'timestamp',
        name: 'Time',
        sortable:true
      },
      {
        field: 'syscheck.event',
        name: 'Action',
        sortable:true
      },
      {
        field: 'rule.description',
        name: 'Rule description',
        sortable:true
      },
      {
        field: 'rule.level',
        name: 'Rule level',
        sortable:true
      },
      {
        field: 'rule.id',
        name: 'Rule ID',
        sortable:true
      },
    ]
  }

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    const { field: sortField, direction: sortDirection } = sort;

    this.setState({
      pageIndex: pageIndex,
      pageSize,
      sortField,
      sortDirection,
    }, async() => this.getAlerts())
  };
  

  getpageIndexItems(){
    let items = [];
    
    const start = (this.state.pageIndex * this.state.pageSize)%this.state.requestSize;
    const end = start + this.state.pageSize
    for(let i=start; i<end && (this.state.pageIndex * this.state.pageSize) < this.state.total ; i++){
      if(this.state.alerts[i] && this.state.alerts[i]._source){
        items.push( { ...this.state.alerts[i]._source, _id :this.state.alerts[i]._id })
      }
    }
    return items;

  }

  onTimeChange = (datePicker: OnTimeChangeProps) => {
    const {start:from, end:to} = datePicker;
    this.setState({datePicker});
    this.timefilter.setTime({from, to});
  }

  getFiltersAsObject(filters){
    var result = {};
    for (var i = 0; i < filters.length; i++) {
      result = {...result, ...filters[i]}
    }
    return result;
  }

  getSearchBar(){
    const recentlyUsedRanges = this.timefilter._history.history.items.map(
      item => ({start:item.from, end: item.to})
    );
    const { datePicker } = this.state;

    return (
      <EuiFlexGroup>
        <EuiFlexItem>
        <WzSearchBar
          onInputChange={this.onFiltersChange}
          qSuggests={[]}
          apiSuggests={null}
          initFilters={this.getFiltersAsObject(this.state.filters)}
          defaultFormat='qTags'
          noDeleteFiltersOnUpdateSuggests={true}
          placeholder='Search' />
        </EuiFlexItem>
        <EuiFlexItem>

        <EuiSuperDatePicker 
          commonlyUsedRanges={this.commonDurationRanges} 
          recentlyUsedRanges={recentlyUsedRanges}
          onTimeChange={this.onTimeChange}
          {...datePicker} />
        </EuiFlexItem>
      </EuiFlexGroup>)
  }

  render() {
   if(this.state.isLoading)
      return (<div style={{alignSelf: "center"}}><EuiLoadingSpinner  size="xl"/> </div>)

  
    const getRowProps = item => {
      const { _id } = item;
      return {
        'data-test-subj': `row-${_id}`,
        className: 'customRowClass',
        onClick: () => this.toggleDetails(item),
      };
    };

    const pageIndexItems = this.getpageIndexItems();
    const columns = this.columns();

    const sorting = {sort:  {
      field: this.state.sortField,
      direction: this.state.sortDirection,
      }
    };
    const pagination = {
      pageIndex: this.state.pageIndex,
      pageSize: this.state.pageSize,
      totalItemCount: this.state.total,
      pageSizeOptions: [10, 25, 50],
    };
      return (
        <div>
          {this.state.total && (
            <div>
              {this.getSearchBar()}
              <EuiFlexGroup>
                <EuiFlexItem>
                {pageIndexItems.length && (
                  <EuiBasicTable
                    items={pageIndexItems}
                    itemId="_id"
                    itemIdToExpandedRowMap={this.state.itemIdToExpandedRowMap}
                    isExpandable={true}
                    columns={columns}
                    rowProps={getRowProps}
                    pagination={pagination}
                    sorting={sorting}
                    onChange={this.onTableChange}
                  />
                )}
                </EuiFlexItem>
              </EuiFlexGroup>
          </div>
          ) || (
            <div>
              {this.getSearchBar()}
              <EuiFlexGroup>
                <EuiFlexItem>
                  There are no events for this file.
                </EuiFlexItem>
              </EuiFlexGroup>
            </div>
          )}
        </div>);    
  }
}