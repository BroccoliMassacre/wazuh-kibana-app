/*
 * Wazuh app - React component for build q queries.
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
  EuiButtonEmpty,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalBody,
  EuiModalHeaderTitle
} from '@elastic/eui';
import { connect } from 'react-redux';
import { showExploreAgentModalGlobal } from '../../redux/actions/appStateActions';
import store from '../../redux/store';
import { AgentSelectionTable } from '../../controllers/overview/components/overview-actions/agents-selection-table';
import chrome from 'ui/chrome';
import { getServices } from 'plugins/kibana/discover/kibana_services';

class WzAgentSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
   
    };
    this.store = store;
  }

  async componentDidMount() {
    const $injector = await chrome.dangerouslyGetActiveInjector();
    this.router = $injector.get('$route');
  }

  closeAgentModal(){
    store.dispatch(showExploreAgentModalGlobal(false));
  }

  agentTableSearch(agentIdList){
    this.closeAgentModal();
    if(window.location.hash.includes('#/overview'))
      this.router.reload();
  }

  removeAgentsFilter(shouldUpdate){
    const { filterManager } = getServices();
    const currentAppliedFilters = filterManager.filters;
    const agentFilters = currentAppliedFilters.filter(x => {
      return x.meta.key === 'agent.id';
    });
    agentFilters.map(x => {
      filterManager.removeFilter(x);
    });
    this.closeAgentModal();
  }

  getSelectedAgents(){
    const selectedAgents = {};
    const agentId = store.getState().appStateReducers.currentAgentData.id;
    if(agentId)
      selectedAgents[agentId] = true;
    return selectedAgents;
  }

  render() {
    let modal = (<></>);

    if (this.props.state.showExploreAgentModalGlobal) {
      modal = (
        <EuiOverlayMask onClick={(e) => { e.target.className === 'euiOverlayMask' && this.closeAgentModal() }}>
          <EuiModal
            className="wz-select-agent-modal"
            onClose={() => this.closeAgentModal()}
            initialFocus="[name=popswitch]"
          >
            <EuiModalHeader>
              <EuiModalHeaderTitle>Explore agent</EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <AgentSelectionTable
                updateAgentSearch={agentsIdList => this.agentTableSearch(agentsIdList)}
                removeAgentsFilter={(shouldUpdate) => this.removeAgentsFilter(shouldUpdate)}
                selectedAgents={this.getSelectedAgents()}
              ></AgentSelectionTable>
            </EuiModalBody>
          </EuiModal>
        </EuiOverlayMask>
      );
    }
    return modal;
  }
}

const mapStateToProps = state => {
  return {
    state: state.appStateReducers
  };
};

export default connect(
  mapStateToProps,
  null
)(WzAgentSelector);
