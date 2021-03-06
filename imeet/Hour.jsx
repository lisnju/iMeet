Hour = React.createClass({
  propTypes: {
    // This component gets each hour to display through a React prop.
    startAt: React.PropTypes.object.isRequired,
    currentUser: React.PropTypes.object,
    meeting: React.PropTypes.object
  },
 
  getDefaultProps: function() {
    return {
      meeting:null
    };
  },
  getInitialState() {
    //Display or hide a form for user to create a meeting
    return {
      displayPopup: false
    }
  },

  deleteMeeting() {

    Meteor.call("removeMeeting", this.props.meeting._id);
  },

  rejectMeeting() {

    Meteor.call("rejectMeeting", this.props.meeting._id);
  },

  acceptMeeting() {

    Meteor.call("acceptMeeting", this.props.meeting._id);
  },

  meetingStatusUnchangedAndIAmIn: function(nextProps){
    return nextProps.meeting && this.props.meeting && this.props.currentUser && nextProps.currentUser
        && MeetingStates.from(nextProps.meeting.statusId) === MeetingStates.from(this.props.meeting.statusId)
        && this.props.meeting.attandants.indexOf(this.props.currentUser._id) != -1  ;
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    //don't render if meeting status unchanged
    if (this.meetingStatusUnchangedAndIAmIn(nextProps)) return false;
    else return true;
  },

  displayPopup:function(){
    this.setState({
      displayPopup : true
    });
    console.log("popup");
  },

  hidePopup:function(){
    this.setState({
      displayPopup : false
    });
  },

//TODO: cancel popup form if click other places without hit enter
  cancelPopup:function(){},

  createMeeting: function(event){


    event.preventDefault();
 
    // Find the text field via the React ref
    var text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
 
 
    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = "";
    this.hidePopup();

    totalUserNumber = 3;

    let numOfAttandants = totalUserNumber;
    let statusId = numOfAttandants===1? MeetingStates.BOOKED.id():MeetingStates.TANTATIVE.id();
    console.log(statusId);
    meetInfo = {
      text : text,
      startAt : this.props.startAt.toDate().getTime(),
      numOfAttandants: numOfAttandants,
      attandants:[this.props.currentUser._id],
      statusId: statusId,
    };


    Meteor.call("addMeeting", meetInfo);
  },

  renderMeeting(meeting){
    const meetingStatusName = MeetingStates.from(meeting.statusId).msg;
    return (
        <div className = {meetingStatusName}>
        <Meeting 
        key={meeting._id} 
        meeting={meeting}/>
        {
          //add buttons for tantative meeting:
          MeetingStates.from(meeting.statusId) === MeetingStates.BOOKED?'':(
          <div>
          <button className="delete" onClick={this.rejectMeeting}>&times;</button>
          { // accept button if not accepted yet
            meeting.attandants.indexOf(this.props.currentUser._id) === -1 ? (<button className="accept" onClick={this.acceptMeeting}>&#10004;</button>) : ''}
          </div>)
        }
        </div>
    )
    
  },

  renderNoUser(){
    return (
      <div className = "noUser">
      login to use
      </div>
      )
  },

  renderAvailable(){
    //console.log("renderAvailable");
    return this.state.displayPopup? (
      <form className="new-task" onSubmit={this.createMeeting} >
              <input
                type="text"
                ref="textInput"
                placeholder="Type to add new meeting" />
      </form> 
      ):(
        <div className = "available">
          <button className="new" onClick={this.displayPopup}>
            +
          </button>
            
        </div>
    )
  },

  render() {
    console.log("HourRender");
    return   this.props.currentUser? (this.props.meeting ? this.renderMeeting(this.props.meeting): this.renderAvailable()) : this.renderNoUser() ;
  },
});