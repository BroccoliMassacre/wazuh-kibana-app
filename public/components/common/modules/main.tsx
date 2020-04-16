/*
 * Wazuh app - Integrity monitoring components
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
  EuiFlexGroup,
  EuiFlexItem,
  EuiHealth,
  EuiTitle,
  EuiToolTip
} from '@elastic/eui';
import '../../common/modules/module.less';
import { updateGlobalBreadcrumb } from '../../../redux/actions/globalBreadcrumbActions';
import store from '../../../redux/store';
import chrome from 'ui/chrome';
import { TabDescription } from '../../../../server/reporting/tab-description';
import { MainFim } from '../../agents/fim';
import { MainSca } from '../../agents/sca';

export class MainModule extends Component {
  constructor(props) {
    super(props);
  }

  setGlobalBreadcrumb() {
    const breadcrumb = [
      {
        text: '',
      },
      {
        text: 'Agents',
        href: "#/agents-preview"
      },
      {
        text: `${this.props.agent.name} (${this.props.agent.id})`,
        onClick: () => {
          window.location.href = `#/agents?agent=${this.props.agent.id}`;
          this.router.reload();
        },
        className: 'wz-global-breadcrumb-btn',
        truncate: true,
      },
      {
        text: TabDescription[this.props.section].title,
      },
    ];
    store.dispatch(updateGlobalBreadcrumb(breadcrumb));
  }

  async componentDidMount() {
    const $injector = await chrome.dangerouslyGetActiveInjector();
    this.router = $injector.get('$route');
    this.setGlobalBreadcrumb();
  }

  color = (status) => {
    if (status.toLowerCase() === 'active') { return 'success'; }
    else if (status.toLowerCase() === 'disconnected') { return 'danger'; }
    else if (status.toLowerCase() === 'never connected') { return 'subdued'; }
  }

  renderTitle() {
    return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiTitle size="s">
            <h1>
              <EuiToolTip position="right" content={this.props.agent.status}>
                <EuiHealth color={this.color(this.props.agent.status)}></EuiHealth>
              </EuiToolTip>
              {this.props.agent.name} ({this.props.agent.id}) - <b>{TabDescription[this.props.section].title}</b>
            </h1>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  render() {
    const { section, agent } = this.props;
    const title = this.renderTitle();
    return (
      <Fragment>
        {(agent && agent.os) &&
          <div className='wz-module'>
            <div className='wz-module-header-agent-wrapper'>
              <div className='wz-module-header-agent'>
                {title}
              </div>
            </div>
            {section === 'fim' && <MainFim {...this.props} />}
            {section === 'sca' && <MainSca {...this.props} />}
          </div>
        }
        {(!agent || !agent.os) &&
          <EuiCallOut title=" This agent has never connected" color="warning" iconType="alert">
          </EuiCallOut>
        }
      </Fragment>
    );
  }
}
