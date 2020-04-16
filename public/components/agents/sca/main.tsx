import React, { Component, Fragment } from 'react';
import { States, Settings } from './index';
import { Events, Loader } from '../../common/modules';

export class MainSca extends Component {
  tabs = [
    { id: 'states', name: 'States' },
    { id: 'events', name: 'Events' },
  ]

  buttons = ['settings']

  constructor(props) {
    super(props);
    this.props.loadSection('states');
    this.props.setTabs(this.tabs, this.buttons);
  }

  render() {
    const { selectView } = this.props;
    if (selectView) {
      return (
        <Fragment>
          <div className='wz-module-body'>
            {selectView === 'states' && <States {...this.props} />}
            {selectView === 'events' && <Events {...this.props} />}
            {selectView === 'loader' &&
              <Loader {...this.props}
                loadSection={(section) => this.props.loadSection(section)}
                redirect={this.props.afterLoad}>
              </Loader>}
            {selectView === 'settings' && <Settings {...this.props} />}
          </div>
        </Fragment>
      );
    } else {
      return false;
    }
  }
}
