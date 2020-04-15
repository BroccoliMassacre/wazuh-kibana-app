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

import { EuiSpacer, EuiTitle, EuiPanel, EuiPage } from '@elastic/eui';

import { i18n } from '@kbn/i18n';

import WzConfigurationPolicyMonitoring from '../../../controllers/management/components/management/configuration/policy-monitoring/policy-monitoring'
import WzBadge from '../../../controllers/management/components/management/configuration/util-components/badge'
import WzReduxProvider from '../../../redux/wz-redux-provider';

type SettingsPropTypes = {
  agent: { id: string },
  clusterNodeSelected?: string
}

type SettingsState = {
  badge: boolean | null
}
export class Settings extends Component<SettingsPropTypes, SettingsState> {
  constructor(props) {
    super(props);
    this.state = {
      badge: null
    }
  }
  updateBadge(badge) {
    this.setState({ badge })
  }
  render() {
    const { badge } = this.state;
    const { agent, clusterNodeSelected } = this.props;
    return (
      <Fragment>
        <WzReduxProvider>
          <EuiPage>
            <EuiPanel>
              <EuiTitle>
                <span>{i18n.translate('wazuh.fim.configuration', { defaultMessage: 'Configuration' })} {typeof badge === 'boolean' ?
                  <WzBadge enabled={badge} /> : null}
                </span>
              </EuiTitle>
              <EuiSpacer size='m' />
              <WzConfigurationPolicyMonitoring
                clusterNodeSelected={clusterNodeSelected}
                agent={agent}
                updateBadge={(e) => this.updateBadge(e)} />
            </EuiPanel>
          </EuiPage>
        </WzReduxProvider>
      </Fragment>
    )
  }
}
