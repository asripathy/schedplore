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
      events: [
        {
          start: new Date(),
          end: new Date(moment().add(1, "hours")),
          title: "Test Event"
        }
      ]
    }
  }
  

  componentDidMount() {
    // this.callApi()
    //   .then(res => this.setState({ response: JSON.stringify(res) }))
    //   .catch(err => console.log(err));
  }

  callApi = async () => {
    let city = this.state.address
    if(city){
      const response = await fetch('/place/' + city);
      const body = await response.json();
      console.log(body);

      if (response.status !== 200) throw Error(body.message);
      this.setState({response: JSON.stringify(body)});
      this.setState({response_hour: JSON.stringify(body[0][11])});
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
    var startDay = startDate.getDay();
    var startHour = startDate.getHours();
    var openPlaces = JSON.parse(this.state.response)[startDay][startHour];
    console.log(openPlaces);
    this.setState({response_hour: JSON.stringify(openPlaces)})
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

  searchOptions = {
    types: ['(cities)']
  }

  placeArr = ["Le Boulanger", "Quiznos", "Taco Bell"];

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Schedplore</h1>
        </header>

        {!this.state.response_hour &&
          <div>
            <p className="App-intro">
              To get started, search a city and select an hour.
            </p>

            <PlacesAutocomplete
              value={this.state.address}
              onChange={this.handleChange}
              onSelect={this.handleSelect}
              searchOptions={this.searchOptions}
            >
              {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                <div>
                  <input
                    {...getInputProps({
                      placeholder: 'Search Places ...',
                      className: 'location-search-input',
                      id: 'city'
                    })}
                  />
                  <div className="autocomplete-dropdown-container">
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
              )}

            </PlacesAutocomplete>
            <button type="submit" onClick={this.callApi}>Search</button>     
          </div>   
        }
        
        {this.state.response_hour &&
          <div class="row cal-and-list">
            <div class="big-cal col-md-9">
              <BigCalendar
                selectable
                onSelectSlot={(slotInfo) => this.onSlotChange(slotInfo) }
                localizer={localizer}
                events={this.state.events}
                defaultDate={new Date()}
                defaultView="week"
              />
            </div>
            
            <div class="place-list-view col-md-3">
              {this.state.response_hour &&
                <PlaceList places={this.state.response_hour}/>
              }
            </div>
          </div>
        }
        

      </div>
    );
  }
}


export default App;
