import React, { Component } from 'react';
import Script from 'react-load-script';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import logo from './logo.svg';
import './App.css';
import PlaceList from './PlaceList.js';
import List from './List.js';
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
      selectedEndDate: ''
    }

    this.updateCalendar = this.updateCalendar.bind(this)
    this.daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  }

  componentDidMount() {
    // this.callApi()
    //   .then(res => this.setState({ response: JSON.stringify(res) }))
    //   .catch(err => console.log(err));
  }

  updateCalendar = (title) => {
    var updatedEvents = this.state.events;
    updatedEvents.push(
      {
         start: this.state.selectedStartDate,
         end: this.state.selectedEndDate,
         title: title
       }
     )
    console.log(updatedEvents);
    this.setState({events : updatedEvents})
  }

  callApi = async () => {
    let city = this.state.address
    if(city){
      const response = await fetch('/place/' + city);
      const body = await response.json();
      console.log(body);
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

  roundStart = (startDate) => {
    startDate.setMinutes(0);
  }

  roundEnd = (endDate) => {
    if (endDate.getMinutes() != 0) { 
      endDate.setMinutes(0);
      endDate.setTime(endDate.getTime() + (60*60*1000)); 
    }
  }

  onSlotChange = (slotInfo) => {
    var startDate = moment(slotInfo.start.toLocaleString()).toDate();
    var endDate = moment(slotInfo.end.toLocaleString()).toDate();
    this.roundStart(startDate);
    this.roundEnd(endDate);
    this.setState({selectedStartDate: startDate});
    this.setState({selectedEndDate: endDate});
    var startDay = startDate.getDay();
    var startHour = startDate.getHours();
    var openPlaces = JSON.parse(this.state.response)[startDay][startHour];
    this.setState({response_hour: JSON.stringify(openPlaces)})
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

  searchOptions = {
    types: ['(cities)']
  }

  placeArr = ["Le Boulanger", "Quiznos", "Taco Bell"];

  render() {
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
                    localizer={localizer}
                    events={this.state.events}
                    defaultDate={new Date()}
                    defaultView="week"
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className="place-list">
                  {this.state.response_hour &&
                    <div>
                      <p className="listText"> {this.daysOfWeek[this.state.selectedStartDate.getDay()]} {this.getTwelveHour(this.state.selectedStartDate.getHours())} {this.getAmPm(this.state.selectedStartDate.getHours())} to {this.getTwelveHour(this.state.selectedEndDate.getHours())} {this.getAmPm(this.state.selectedEndDate.getHours())}</p>
                      <div className="place-list-view">
                      <PlaceList  places={this.state.response_hour} updateCalendar={this.updateCalendar}/>
                      </div>
                    </div>
                  }
                </div>
                {!this.state.response_hour &&
                    <div className="emptyListMessage"> 
                      <p className="listText"> Select a time slot to view open restaurants :) </p>
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
