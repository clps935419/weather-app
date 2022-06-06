import React, { useCallback, useEffect, useState, useMemo } from 'react';
function fetchCurrentWeatherData({ AUTHORIZATION_KEY, locationName }) {
    return fetch(
        `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${AUTHORIZATION_KEY}&format=JSON&locationName=${locationName}`
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

function fetchForecastWeatherDate({
    AUTHORIZATION_KEY,
    cityName,
}) {
    return fetch(
        `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${AUTHORIZATION_KEY}&format=JSON&locationName=${cityName}`
    )
        .then((res) => res.json())
        .then((data) => {
            const locationData = data.records.location[0];
            const weatherEle = locationData.weatherElement.reduce(
                (need, curr) => {
                    if (['Wx', 'PoP', 'CI'].includes(curr.elementName)) {
                        need[curr.elementName] = curr.time[0].parameter;
                    }
                    return need;
                },
                {}
            );
            return {
                description: weatherEle.Wx.parameterName,
                weatherCode: weatherEle.Wx.parameterValue,
                rainPossibility: weatherEle.PoP.parameterName,
                comfortability: weatherEle.CI.parameterName,
            };
        });
}
function useWeatherApi({ AUTHORIZATION_KEY, cityName, locationName }) {
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
    const fetchAllData = useCallback(async () => {
        setWeatherData((prev) => {
            return {
                ...prev,
                isLoading: true,
            };
        });
        const [currentData, forecastData] = await Promise.all([
            fetchCurrentWeatherData({ AUTHORIZATION_KEY, locationName }),
            fetchForecastWeatherDate({
                AUTHORIZATION_KEY,
                cityName,
            }),
        ]);
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
    return [weatherData, fetchAllData];
}
export default useWeatherApi;
