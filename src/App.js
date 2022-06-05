
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import {getMoment} from "@/utility/helper";
import WeatherCard from '@/view/WeatherCard';

const theme = {
    light: {
        backgroundColor: '#ededed',
        foregroundColor: '#f9f9f9',
        boxShadow: '0 1px 3px 0 #999999',
        titleColor: '#212121',
        temperatureColor: '#757575',
        textColor: '#828282',
    },
    dark: {
        backgroundColor: '#1F2022',
        foregroundColor: '#121416',
        boxShadow:
            '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
        titleColor: '#f9f9fa',
        temperatureColor: '#dddddd',
        textColor: '#cccccc',
    },
};

const Container = styled.div`
    background-color: ${({ theme }) => theme.backgroundColor};
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;




const AUTHORIZATION_KEY = `CWB-BFADAE5F-15DA-4E82-90EC-2B2AEB824B1A`;
const LOCATION = '466920';
const LOCATION_FORECAST_NAME = '臺北市';

function fetchCurrentWeatherData() {
    return fetch(
        `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${AUTHORIZATION_KEY}&format=JSON&stationId=${LOCATION}`
    )
        .then((res) => res.json())
        .then((data) => {
            const locationData = data.records.location[0];
            const weatherEle = locationData.weatherElement.reduce(
                (prev, curr) => {
                    if (['WDSD', 'TEMP'].includes(curr.elementName)) {
                        prev[curr.elementName] = curr.elementValue;
                    }
                    return prev;
                },
                {}
            );
            return {
                locationName: locationData.locationName,
                description: '多雲',
                windSpeed: weatherEle.WDSD,
                temperature: weatherEle.TEMP,
                rainPossibility: 60,
                observationTime: locationData.time.obsTime,
                isLoading: false,
            };
        });
}

function fetchForecastWeatherDate() {
    return fetch(
        `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${AUTHORIZATION_KEY}&format=JSON&locationName=${LOCATION_FORECAST_NAME}`
    )
        .then((res) => res.json())
        .then((data) => {
            const locationData = data.records.location[0];
            console.log(
                '🚀 ~ file: App.js ~ line 211 ~ .then ~ locationData',
                locationData
            );
            const weatherEle = locationData.weatherElement.reduce(
                (need, curr) => {
                    console.log('pre', need, curr);
                    if (['Wx', 'PoP', 'CI'].includes(curr.elementName)) {
                        need[curr.elementName] = curr.time[0].parameter;
                    }
                    return need;
                },
                {}
            );
            console.log('data', weatherEle);
            return {
                description: weatherEle.Wx.parameterName,
                weatherCode: weatherEle.Wx.parameterValue,
                rainPossibility: weatherEle.PoP.parameterName,
                comfortability: weatherEle.CI.parameterName,
            };
        });
}

const App = () => {
    const [currentTheme, setCurrentTheme] = useState('dark');
    const [weatherData, setWeatherData] = useState({
        locationName: '',
        description: '',
        windSpeed: 0,
        temperature: 0,
        rainPossibility: 0,
        observationTime: new Date(),
        isLoading: true,
        comfortability: '',
        weatherCode: 0,
    });
    
    const moment = useMemo(() => getMoment(LOCATION_FORECAST_NAME), []);
    const fetchAllData = useCallback(async () => {
        setWeatherData((prev) => {
            return {
                ...prev,
                isLoading: true,
            };
        });
        const [currentData, forecastData ] = await Promise.all([
            fetchCurrentWeatherData(),
            fetchForecastWeatherDate(),
        ]);
                console.log(
                    '🚀 ~ file: App.js ~ line 231 ~ fetchAllData ~ currentData',
                    currentData,
                    forecastData
                );

        setWeatherData((prev) => {
            return {
                ...currentData,
                ...forecastData,
                isLoading: false,
            };
        });
    }, []);
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);
        useEffect(() => {
            setCurrentTheme(moment==='day'?'light':'dark');
        }, [moment]);
    return (
        <ThemeProvider theme={theme[currentTheme]}>
            <Container>
                <WeatherCard weatherData={weatherData} moment={moment} onChange={fetchAllData}/>
            </Container>
        </ThemeProvider>
    );
};

export default App;
