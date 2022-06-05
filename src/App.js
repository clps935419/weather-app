import { ReactComponent as AirFlowIcon } from './images/airFlow.svg';
import { ReactComponent as DayCloudyIcon } from './images/day-cloudy.svg';
import { ReactComponent as RainIcon } from './images/rain.svg';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { ReactComponent as RefreshIcon } from './images/refresh.svg';
import { ReactComponent as LoadingIcon } from './images/loading.svg';
import styled, { ThemeProvider } from 'styled-components';
import dayjs from 'dayjs';
import WeatherIcon from '@/components/WeatherIcon';
import {getMoment} from "@/utility/helper";
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

const WeatherCard = styled.div`
    position: relative;
    min-width: 360px;
    box-shadow: ${({ theme }) => theme.boxShadow};
    background-color: ${({ theme }) => theme.foregroundColor};
    box-sizing: border-box;
    padding: 30px 15px;
`;

const Location = styled.div`
    font-size: 28px;
    color: ${({ theme }) => theme.titleColor};
    margin-bottom: 20px;
`;

const Description = styled.div`
    font-size: 16px;
    color: ${({ theme }) => theme.textColor};
    margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
`;

const Temperature = styled.div`
    color: ${({ theme }) => theme.temperatureColor};
    font-size: 96px;
    font-weight: 300;
    display: flex;
`;

const Celsius = styled.div`
    font-weight: normal;
    font-size: 42px;
`;

const AirFlow = styled.div`
    display: flex;
    align-items: center;
    font-size: 16x;
    font-weight: 300;
    color: ${({ theme }) => theme.textColor};
    margin-bottom: 20px;
    svg {
        width: 25px;
        height: auto;
        margin-right: 30px;
    }
`;

const Rain = styled.div`
    display: flex;
    align-items: center;
    font-size: 16x;
    font-weight: 300;
    color: ${({ theme }) => theme.textColor};
    svg {
        width: 25px;
        height: auto;
        margin-right: 30px;
    }
`;

const DayCloudy = styled(DayCloudyIcon)`
    flex-basis: 30%;
`;

const Refresh = styled.div`
    @keyframes rotate {
        from {
            transform: rotate(360deg);
        }
        to {
            transform: rotate(0deg);
        }
    }
    svg {
        animation: rotate infinite 1.5s linear;
        animation-duration: ${({ isLoading }) => (isLoading ? '1.5s' : '0s')};
    }
    position: absolute;
    right: 15px;
    bottom: 15px;
    font-size: 12px;
    display: inline-flex;
    align-items: flex-end;
    color: ${({ theme }) => theme.textColor};
    svg {
        margin-left: 10px;
        width: 15px;
        height: 15px;
        cursor: pointer;
    }
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
    const {
        locationName,
        description,
        windSpeed,
        temperature,
        rainPossibility,
        observationTime,
        isLoading,
        comfortability,
        weatherCode,
    } = weatherData;
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
                <WeatherCard>
                    <Location theme="dark">{locationName}</Location>
                    <Description>
                        {description}
                        {comfortability}
                    </Description>
                    <CurrentWeather>
                        <Temperature>
                            {Math.round(temperature)}
                            <Celsius>°C</Celsius>
                        </Temperature>
                        <WeatherIcon
                            moment={moment}
                            weatherCode={weatherCode}
                        />
                    </CurrentWeather>
                    <AirFlow>
                        <AirFlowIcon /> {windSpeed} m/h
                    </AirFlow>
                    <Rain>
                        <RainIcon /> {rainPossibility}%
                    </Rain>
                    <Refresh
                        onClick={() => {
                            fetchAllData();
                        }}
                        isLoading={isLoading}
                    >
                        {new Intl.DateTimeFormat('zh-TW', {
                            hour: 'numeric',
                            minute: 'numeric',
                        }).format(dayjs(observationTime))}
                        {isLoading ? <LoadingIcon /> : <RefreshIcon />}
                    </Refresh>
                </WeatherCard>
            </Container>
        </ThemeProvider>
    );
};

export default App;
