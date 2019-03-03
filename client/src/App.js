import React, { Component } from 'react';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import './App.css';
import PlaceList from './PlaceList.js';
import BigCalendar from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import moment from 'moment'

const localizer = BigCalendar.momentLocalizer(moment)

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      response: '',
      address: '',
      events: [],
      selectedStartDate: '',
      selectedEndDate: '',
      modalVisible: false,
      selectedEvent: {}
    }

    this.toggleModal = this.toggleModal.bind(this);
    this.updateCalendar = this.updateCalendar.bind(this);
    this.daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  }

  toggleModal() {
    const modalVisible = !this.state.modalVisible;
    this.setState({
      modalVisible
    });
  }

  updateCalendar = (place) => {
    var updatedEvents = this.state.events;
    var address = {
      id : place.id,
      title : place.address
    };
    updatedEvents.push(
      {
         start: this.state.selectedStartDate,
         end: this.state.selectedEndDate,
         title: place.name,
         resource: address
       }
     )
     console.log(updatedEvents);
    this.setState({events : updatedEvents})
  }

  deleteEvent = () => {
    var updatedEvents = this.state.events;
    var selectedEvent = this.state.selectedEvent;
    updatedEvents.splice(updatedEvents.findIndex(v => v.title == selectedEvent.title && v.start == selectedEvent.start && v.end == selectedEvent.end), 1);
    this.setState({events: updatedEvents});
    this.toggleModal();
  }

  callApi = async () => {
    let city = this.state.address
    if(city){
      const response = await fetch('/place/' + city);
      const body = await response.json();
      if (response.status !== 200) throw Error(body.message);
      this.setState({response: JSON.stringify(body)});
    }
  };

  handleChange = (address) => {
    this.setState({ address })
  }

  handleSelect = (address) => {
    geocodeByAddress(address)
      .then(results => getLatLng(results[0]))
      .then(latLng => console.log('Success', latLng))
      .catch(error => console.error('Error', error))
  }

  onSlotChange = (slotInfo) => {
    var startDate = moment(slotInfo.start.toLocaleString()).toDate();
    var endDate = moment(slotInfo.end.toLocaleString()).toDate();
    this.setState({selectedStartDate: startDate});
    this.setState({selectedEndDate: endDate});
    var startDay = startDate.getDay();
    var startHour = startDate.getHours();
    var endHour = endDate.getHours();
    var openPlaces = JSON.parse(this.state.response)[startDay][startHour];
    for (var hour = startHour + 1; hour < endHour; hour++) {
      var places = JSON.parse(this.state.response)[startDay][hour];
      var updatedPlaces = [];
      for (var i = 0; i < openPlaces.length; i++) {
        var openPlace = openPlaces[i];
        if (places.some(e => e.id === openPlace.id)) {
          updatedPlaces.push(openPlace);
        }
      }
      openPlaces = updatedPlaces;
    }
    this.setState({response_hour: JSON.stringify(openPlaces)})
  }

  onSelectEvent = (event) => {
    this.setState({selectedEvent: event});
    this.toggleModal();
  }

  clearSearch = () => {
    this.setState({response: ''});
    this.setState({response_hour: ''});
  }

  clearCalendar = () => {
    this.setState({events: []});
  }

  addEvent = () => {
    // var updatedEvents = this.state.events;
    // updatedEvents.push(
    //   {
    //     start: new Date(),
    //     end: new Date(moment().add(2, "hours")),
    //     title: "New Event"
    //   }
    // )
    // this.setState({events : updatedEvents})
  }

  getTwelveHour = (hour) => {
    return hour % 12 == 0 ? 12 : hour % 12;
  }

  getAmPm = (hour) => {
    return hour >= 12 ? 'pm' : 'am'
  }

  generateRangeForCurentTimeSlot = () => {
    return this.generateRange(this.state.selectedStartDate, this.state.selectedEndDate);
  }

  eventSelected = () => {
    return 'start' in this.state.selectedEvent;
  }

  generateRangeForCurrentEvent = () => {
    if (this.eventSelected()) {
      return this.generateRange(this.state.selectedEvent.start, this.state.selectedEvent.end);
    }
  }

  getcurrentEventAddress = () => {
    if (this.eventSelected()) {
      return this.state.selectedEvent.resource.title;
    }
  }

  generateRange = (startDate, endDate) => {
    return this.daysOfWeek[startDate.getDay()] + " " +  this.getTwelveHour(startDate.getHours()) +  this.getAmPm(startDate.getHours()) + ' to ' +   this.getTwelveHour(endDate.getHours()) +  this.getAmPm(endDate.getHours());
  }

  searchOptions = {
    types: ['(cities)']
  }

  placeArr = ["Le Boulanger", "Quiznos", "Taco Bell"];

  render() {
    let styles = this.state.modalVisible
      ? { display: "block" }
      : { display: "none" };
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title"> Schedplore </h1>
        </header>

        {!this.state.response &&
          <div>
            <PlacesAutocomplete
              value={this.state.address}
              onChange={this.handleChange}
              onSelect={this.handleSelect}
              searchOptions={this.searchOptions}
            >
              {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                <div>
                  <div className="row">
                    <div className="col-md-4 offset-md-4 mt-5">
                      <div className="input-group">
                        <input
                          {...getInputProps({
                            placeholder: 'Search for a City',
                            className: 'form-control location-search-input',
                            id: 'city',
                          })}
                        />
                        <span className="input-group-btn">
                          <button className="btn btn-primary" onClick={this.callApi}> Search </button>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="autocomplete-dropdown-container col-md-4 offset-md-4">
                      {suggestions.map(suggestion => {
                        const className = suggestion.active ? 'suggestion-item--active' : 'suggestion-item';
                        // inline style for demonstration purpose
                        const style = suggestion.active
                          ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                          : { backgroundColor: '#ffffff', cursor: 'pointer' };
                        return (
                          <div {...getSuggestionItemProps(suggestion, { className, style })}>
                            <span>{suggestion.description}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

            </PlacesAutocomplete>
          </div>   
        }
        
        {this.state.response &&
          <div>
            <button className="btn btn-light back-button" onClick={this.clearSearch}> Back to Search </button>
            <button className="btn btn-warning clear-calendar" onClick={this.clearCalendar}> Clear Calendar </button>
            <div className="row cal-and-list">
              <div className="big-cal-container col-md-9">
                <div className="big-cal">
                  <BigCalendar
                    selectable
                    onSelectSlot={(slotInfo) => this.onSlotChange(slotInfo) }
                    onSelectEvent={(event) => this.onSelectEvent(event) }
                    views={['week', 'day', 'agenda']}
                    localizer={localizer}
                    events={this.state.events}
                    defaultDate={new Date()}
                    defaultView="week"
                    step={60}
                    timeslots={1}
                  />
                </div>
                <div className="modal" role="dialog" tabIndex='-1' style={styles}>
                  <div className="modal-dialog event-modal">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">
                          {this.state.selectedEvent.title}
                        </h5>
                        <button type="button" className="close" onClick={this.toggleModal}>
                          <span>&times;</span>
                        </button>
                      </div>
                      <div className="modal-body event-modal-body">
                        <p> Address: {this.getcurrentEventAddress()} </p>
                        <p> Time: {this.generateRangeForCurrentEvent()} </p>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={this.deleteEvent}>Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="place-list">
                  {this.state.response_hour &&
                    <div>
                      <p className="listText"> {this.generateRangeForCurentTimeSlot()}</p>
                      <div className="place-list-view">
                      <PlaceList  places={this.state.response_hour} updateCalendar={this.updateCalendar}/>
                      </div>
                    </div>
                  }
                </div>
                {!this.state.response_hour &&
                    <div className="emptyListMessage"> 
                      <p className="listText"> Select a time slot from the calendar </p>
                    </div>
                  }
              </div>
            </div>                  
          </div>
        }
        

      </div>
    );
  }
}


export default App;
