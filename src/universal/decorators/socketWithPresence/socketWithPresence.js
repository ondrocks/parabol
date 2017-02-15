import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxSocket} from 'redux-socket-cluster';
import {cashay} from 'cashay';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import reduxSocketOptions from 'universal/redux/reduxSocketOptions';
import {JOIN_TEAM, REJOIN_TEAM, NOTIFICATIONS, PRESENCE, TEAM_MEMBERS, TEAM} from 'universal/subscriptions/constants';
import socketCluster from 'socketcluster-client';
import presenceSubscriber from 'universal/subscriptions/presenceSubscriber';
import parseChannel from 'universal/utils/parseChannel';
import {showInfo, showWarning} from 'universal/modules/toast/ducks/toastDuck';
import {withRouter} from 'react-router';
import {
  APP_VERSION_KEY,
  APP_UPGRADE_PENDING_KEY,
  APP_UPGRADE_PENDING_RELOAD
} from 'universal/utils/constants';

const getTeamName = (teamId) => {
  const cashayState = cashay.store.getState().cashay;
  const team = cashayState.entities.Team && cashayState.entities.Team[teamId];
  return team && team.name || teamId;
};

const mapStateToProps = (state) => {
  return {
    tms: state.auth.obj.tms,
    userId: state.auth.obj.sub
  };
};

const tmsSubs = [];

export default ComposedComponent => {
  @requireAuth
  @reduxSocket({}, reduxSocketOptions)
  @connect(mapStateToProps)
  @withRouter
  class SocketWithPresence extends Component {
    static propTypes = {
      user: PropTypes.object,
      dispatch: PropTypes.func,
      params: PropTypes.shape({
        teamId: PropTypes.string
      }),
      router: PropTypes.object,
      tms: PropTypes.array
    };

    componentDidMount() {
      this.subscribeToPresence({}, this.props);
      this.subscribeToNotifications();
      console.log('did mount watchin FOR KICKING OUT');
      this.watchForKickout();
      // this.watchForJoin();
      this.listenForVersion();
    }
    componentWillReceiveProps(nextProps) {
      this.subscribeToPresence(this.props, nextProps);
    }

    componentWillUnmount() {
      const socket = socketCluster.connect();
      socket.off('kickOut', this.kickoutHandler);
      socket.off('version', this.versionHandler);

    }
    render() {
      return <ComposedComponent {...this.props}/>;
    }

    kickoutHandler = (error, channelName) => {
      const {dispatch} = this.props;
      const {channel, variableString: teamId} = parseChannel(channelName);
      if (channel === TEAM) {
        const teamName = getTeamName(teamId);
        const {router} = this.props;
        const onExTeamRoute = router.isActive(`/team/${teamId}`) || router.isActive(`/meeting/${teamId}`);
        if (onExTeamRoute) {
          router.push('/me');
        }
        console.log('dispatching SO LONG', channelName)
        dispatch(showWarning({
          title: 'So long!',
          message: `You have been removed from ${teamName}`
        }));
      }
    };

    watchForJoin(teamId) {
      const socket = socketCluster.connect();
      const channelName = `${PRESENCE}/${teamId}`;
      const {dispatch} = this.props;
      socket.watch(channelName, (data) => {
        if (data.type === JOIN_TEAM) {
          const {name} = data;
          const teamName = getTeamName(teamId);
          dispatch(showInfo({
            title: 'Ahoy, a new crewmate!',
            message: `${name} just joined team ${teamName}`
          }));
        } else if (data.type === REJOIN_TEAM) {
          const {name} = data;
          const teamName = getTeamName(teamId);
          dispatch(showInfo({
          title: `${name} is back!`,
            message: `${name} just rejoined team ${teamName}`
          }));
        }
      });
    }

    watchForKickout() {
      const socket = socketCluster.connect();
      socket.on('kickOut', this.kickoutHandler);
      console.log('socket', socket)
    }
    subscribeToNotifications() {
      const {userId} = this.props;
      cashay.subscribe(NOTIFICATIONS, userId);
    }

    subscribeToPresence(oldProps, props) {
      const {tms} = props;
      if (!tms) {
        throw new Error('Did not finish the welcome wizard! How did you get here?');
        // TODO redirect?
      }
      if (oldProps.tms !== tms) {
        const socket = socketCluster.connect();
        // window.socket = socket;
        for (let i = 0; i < tms.length; i++) {
          const teamId = tms[i];
          if (tmsSubs.includes(teamId)) continue;
          tmsSubs.push(teamId);
          cashay.subscribe(PRESENCE, teamId, presenceSubscriber);
          cashay.subscribe(TEAM_MEMBERS, teamId);
          socket.on('subscribe', (channelName) => {
            if (channelName === `${PRESENCE}/${teamId}`) {
              const options = {variables: {teamId}};
              cashay.mutate('soundOff', options);
            }
          });
          this.watchForJoin(teamId);
        }
      }
    }

    versionHandler = (versionOnServer) => {
      const {dispatch, router} = this.props;
      const versionInStorage = window.localStorage.getItem(APP_VERSION_KEY);
      if (versionOnServer !== versionInStorage) {
        dispatch(showWarning({
          title: 'New stuff!',
          message: 'A new version of action is available',
          autoDismiss: 0,
          action: {
            label: 'Log out and upgrade',
            callback: () => {
              router.replace('/signout');
            }
          }
        }));
        window.sessionStorage.setItem(APP_UPGRADE_PENDING_KEY,
          APP_UPGRADE_PENDING_RELOAD);
      }
    };

    listenForVersion() {
      const socket = socketCluster.connect();
      socket.on('version', this.versionHandler);
    }
  }
  return SocketWithPresence;
};
