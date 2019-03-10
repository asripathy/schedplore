import React, { Component } from 'react';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import './App.css';
import PlaceList from './PlaceList.js';
import BigCalendar from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

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
      slotHighlightVisible: false,
      selectedEvent: {},
      selectedType: 'food',
      validSearch: false,
      editingSearch: true,
      loadingResults: false
    }
    
    this.handleTypeChange = this.handleTypeChange.bind(this);
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

  handleTypeChange(event) {
      var type = event.currentTarget.querySelector("input").value;
      this.setState({ selectedType: type });
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
    this.setState({slotHighlightVisible: false});
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
    this.setState({editingSearch: false});
    if (this.state.validSearch) {
      this.setState({loadingResults: true});
      let city = this.state.address
      if (city) {
        const response = await fetch('/place/' + city);
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        this.setState({loadingResults: false});
        this.setState({response: JSON.stringify(body)});
      }
    }
  };

  handleChange = (address) => {
    this.setState({editingSearch: true});
    this.setState({validSearch: false});
    this.setState({ address });
  }

  handleSelect = (address) => {
    this.setState({editingSearch: true});
    this.setState({validSearch: true});
    this.setState({ address });
    geocodeByAddress(address)
      .then(results => getLatLng(results[0]))
      .then(latLng => console.log('Success', latLng))
      .catch(error => console.error('Error', error))
  }

  onSlotChange = (slotInfo) => {
    var startDate = slotInfo.start;
    var endDate = slotInfo.end;
    this.setState({selectedStartDate: startDate});
    this.setState({selectedEndDate: endDate});
    this.setState({slotHighlightVisible: true});
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

  slotStyleGetter = (date) => {
    if (this.state.slotHighlightVisible && this.state.selectedStartDate && this.state.selectedEndDate &&
      date.getTime() >= this.state.selectedStartDate.getTime() &&
      date.getTime() < this.state.selectedEndDate.getTime()) {
      return {
        className: 'selectedSlot'
      };
    }
  }

  onSelectEvent = (event) => {
    this.setState({selectedEvent: event});
    this.toggleModal();
  }

  clearSearch = () => {
    this.setState({response: ''});
    this.setState({response_hour: ''});
    this.setState({slotHighlightVisible: false});
    this.clearCalendar();
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
    let modalstyles = this.state.modalVisible
      ? { display: "block" }
      : { display: "none" };
    let searcherrorstyles = !this.state.validSearch && !this.state.editingSearch
      ? { display: "block" }
      : { display: "none" };
    let appstyles = !this.state.response 
      ? { position: "absolute",
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '50vh' }
      : {};
    let appheaderstyles = !this.state.response 
      ? { 'fontSize': '50px' }
      : { 'fontSize': '35px'};
    return (
      <div className="App" style={appstyles}>
        <header className="App-header">
          <h1 className="App-title" style={appheaderstyles}> Schedplore </h1>
        </header>

        {!this.state.response && !this.state.loadingResults &&
          <div>
            <PlacesAutocomplete
              value={this.state.address}
              onChange={this.handleChange}
              onSelect={this.handleSelect}
              searchOptions={this.searchOptions}
            >
              {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                <div>
                  <div className="search-bar-container row">
                    <div  className="col-md-8 offset-md-2">
                      <div className="input-group search-bar-group">
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
                      <div className="warning-container" style={searcherrorstyles}>
                        <p className="warning-text"> Please select a city using the dropdown. </p>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-8 offset-md-2">
                      <div className="autocomplete-dropdown-container">
                        {suggestions.map(suggestion => {
                          const className = suggestion.active ? 'suggestion-item-active' : 'suggestion-item';
                          return (
                            <div {...getSuggestionItemProps(suggestion, { className })}>
                              <span>{suggestion.description}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </PlacesAutocomplete>
          </div>   
        }

        {this.state.loadingResults &&
          <div className="loader"></div>
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
                    localizer={localizer}
                    events={this.state.events}
                    views={['week', 'day', 'agenda']}
                    step={60}
                    timeslots={1}
                    defaultView={BigCalendar.Views.WEEK}
                    scrollToTime={new Date(1970, 1, 1, 10)}
                    onSelectSlot={(slotInfo) => this.onSlotChange(slotInfo)}
                    onSelectEvent={(event) => this.onSelectEvent(event)}
                    slotPropGetter={(date) => this.slotStyleGetter(date)}
                  />
                </div>
                <div className="modal" role="dialog" tabIndex='-1' style={modalstyles}>
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
                      <div className="type-buttons row">
                          <div className="btn-group btn-group-toggle col-md-10 offset-md-1" data-toggle="buttons">
                              <label className="btn btn-light active col-md-4" onClick={this.handleTypeChange}>
                                  <input type="radio" name="placeType" value="food" autoComplete="off" checked /> <p className="tabText"> Food </p>
                              </label>
                              <label className="btn btn-light col-md-8" onClick={this.handleTypeChange}>
                                  <input type="radio" name="placeType" value="attraction" autoComplete="off" /> <p className="tabText"> Attractions </p> 
                              </label>
                          </div> 
                      </div>
                      <div className="place-list-view">
                        <PlaceList  places={this.state.response_hour} updateCalendar={this.updateCalendar} selectedType={this.state.selectedType}/>
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
