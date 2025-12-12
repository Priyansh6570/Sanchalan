// src/lib/youtube/analytics.js

const YOUTUBE_ANALYTICS_API = 'https://youtubeanalytics.googleapis.com/v2/reports'

// Helper function to make analytics API requests
async function fetchAnalyticsReport(videoId, accessToken, dimensions = '', filters = '', metrics = 'views') {
  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate: '2000-01-01',
    endDate: new Date().toISOString().split('T')[0],
    metrics,
    filters: `video==${videoId}${filters ? `;${filters}` : ''}`,
    ...(dimensions && { dimensions }),
    sort: '-views'
  })

  const response = await fetch(`${YOUTUBE_ANALYTICS_API}?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Analytics API error: ${response.statusText}`)
  }

  return await response.json()
}

// Get basic video analytics
export async function getVideoAnalytics(videoId, accessToken) {
  return fetchAnalyticsReport(
    videoId,
    accessToken,
    '',
    '',
    'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained'
  )
}

// Get Channel Analytics
export async function getChannelAnalytics(accessToken) {
  return fetchAnalyticsReport(
    '',
    accessToken,
    '',
    '',
    'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained'
  )
}

// Get traffic sources
export async function getTrafficSources(videoId, accessToken) {
  return fetchAnalyticsReport(
    videoId,
    accessToken,
    'insightTrafficSourceType',
    '',
    'views'
  )
}

// Get geographic data (countries, states, cities)
export async function getGeographicData(videoId, accessToken) {
  try {
    // Fetch countries
    const countriesData = await fetchAnalyticsReport(
      videoId,
      accessToken,
      'country',
      '',
      'views'
    )

    const countries = countriesData.rows?.map(row => ({
      country: row[0],
      countryName: row[0], // You can map this to full country names if needed
      views: row[1]
    })) || []

    // Fetch provinces/states (US only by default)
    let states = []
    try {
      const statesData = await fetchAnalyticsReport(
        videoId,
        accessToken,
        'province',
        'country==US',
        'views'
      )
      states = statesData.rows?.map(row => ({
        state: row[0],
        views: row[1]
      })) || []
    } catch (e) {
      console.log('States data not available:', e.message)
    }

    // Cities are not available in standard YouTube Analytics API
    // You would need YouTube Data API v3 for more detailed location data

    return {
      countries: countries.slice(0, 20), // Top 20 countries
      states: states.slice(0, 20), // Top 20 states
      cities: [] // Not available in standard API
    }
  } catch (error) {
    console.error('Geographic data fetch error:', error)
    throw error
  }
}

// Get demographic data (age groups and gender)
export async function getDemographicData(videoId, accessToken) {
  try {
    // Fetch age groups
    const ageData = await fetchAnalyticsReport(
      videoId,
      accessToken,
      'ageGroup',
      '',
      'viewerPercentage'
    )

    const ageGroups = ageData.rows?.map(row => ({
      ageGroup: row[0],
      percentage: row[1]
    })) || []

    // Fetch gender distribution
    const genderData = await fetchAnalyticsReport(
      videoId,
      accessToken,
      'gender',
      '',
      'viewerPercentage'
    )

    const genderDistribution = genderData.rows?.map(row => ({
      gender: row[0],
      percentage: row[1]
    })) || []

    return {
      ageGroups,
      genderDistribution
    }
  } catch (error) {
    console.error('Demographic data fetch error:', error)
    throw error
  }
}

// Get device type data
export async function getDeviceData(videoId, accessToken) {
  try {
    // Fetch device types
    const deviceData = await fetchAnalyticsReport(
      videoId,
      accessToken,
      'deviceType',
      '',
      'views'
    )

    const deviceTypes = deviceData.rows?.map(row => ({
      device: row[0],
      views: row[1]
    })) || []

    // Fetch operating systems
    const osData = await fetchAnalyticsReport(
      videoId,
      accessToken,
      'operatingSystem',
      '',
      'views'
    )

    const operatingSystems = osData.rows?.map(row => ({
      os: row[0],
      views: row[1]
    })) || []

    // Fetch playback locations
    const playbackData = await fetchAnalyticsReport(
      videoId,
      accessToken,
      'insightPlaybackLocationType',
      '',
      'views'
    )

    const playbackLocations = playbackData.rows?.map(row => ({
      location: row[0],
      views: row[1]
    })) || []

    return {
      deviceTypes: deviceTypes.slice(0, 10),
      operatingSystems: operatingSystems.slice(0, 10),
      playbackLocations: playbackLocations.slice(0, 10)
    }
  } catch (error) {
    console.error('Device data fetch error:', error)
    throw error
  }
}

// Get subtitle usage data
export async function getSubtitleUsageData(videoId, accessToken) {
  try {
    // Check if subtitles are enabled/disabled during viewing
    const subtitleEnabledData = await fetchAnalyticsReport(
      videoId,
      accessToken,
      'subscribedStatus',
      '',
      'views'
    )

    const enabled = subtitleEnabledData.rows?.map(row => ({
      status: row[0],
      views: row[1]
    })) || []

    // Note: Specific subtitle language usage is not directly available 
    // in YouTube Analytics API. You would need to track this separately
    // or use YouTube Data API v3 with custom tracking

    return {
      enabled,
      topLanguages: [] // Not available in standard API
    }
  } catch (error) {
    console.error('Subtitle usage data fetch error:', error)
    throw error
  }
}