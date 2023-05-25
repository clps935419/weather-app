import React, { useCallback, useEffect, useState, useMemo } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { getMoment } from '@/utility/helper';
import WeatherCard from '@/view/WeatherCard';
import useWeatherApi from '@/hook/useWeatherApi';
import WeatherSetting from '@/view/WeatherSetting';
import { findLocation } from '@/utility/helper';

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

const AUTHORIZATION_KEY = `CWB-44F16CDF-B27E-4C26-8F4D-AF35E7A8F998`;
const LOCATION = '466920';
const LOCATION_FORECAST_NAME = '臺北市';

const App = () => {
    const [currentTheme, setCurrentTheme] = useState('dark');
    const [currentPage, setCurrentPage] = useState('weatherCard');
    const [currentCity, setCurrentCity] = useState("臺北市");
    const currentLocation = useMemo(()=>findLocation(currentCity));
    const { cityName, locationName, sunriseCityName } = currentLocation;
    const [weatherData, fetchAllData] = useWeatherApi({
        AUTHORIZATION_KEY,
        cityName,
        locationName,
    });
    const moment = useMemo(() => getMoment(sunriseCityName), [sunriseCityName]);
    const handleCurrentPage = (page) => {
        setCurrentPage(page);
    };
    const handleChangeCity = (city)=>{
        setCurrentCity(city);
    }

    useEffect(() => {
        setCurrentTheme(moment === 'day' ? 'light' : 'dark');
    }, [moment]);
    return (
        <ThemeProvider theme={theme[currentTheme]}>
            <Container>
                {currentPage === 'weatherCard' ? (
                    <WeatherCard
                        cityName={cityName}
                        weatherData={weatherData}
                        moment={moment}
                        onChange={fetchAllData}
                        onChangePage={handleCurrentPage}
                    />
                ) : (
                    <WeatherSetting
                        onChangePage={handleCurrentPage}
                        onChangeCity={handleChangeCity}
                        city={currentCity}
                    />
                )}
            </Container>
        </ThemeProvider>
    );
};

export default App;
