import axios from 'axios'

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT

const pinataApi = axios.create({
  baseURL: 'https://api.pinata.cloud',
  headers: {
    'Authorization': `Bearer ${PINATA_JWT}`,
    'Content-Type': 'application/json'
  }
})

export const pinataService = {
  // Upload file to IPFS via Pinata
  async uploadFile(file, metadata = {}) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Add metadata
      const pinataMetadata = {
        name: metadata.name || file.name,
        keyvalues: {
          type: metadata.type || 'incident-recording',
          timestamp: metadata.timestamp || new Date().toISOString(),
          userId: metadata.userId || 'anonymous',
          ...metadata.customData
        }
      }
      
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata))
      
      const pinataOptions = {
        cidVersion: 1,
        customPinPolicy: {
          regions: [
            {
              id: 'FRA1',
              desiredReplicationCount: 2
            },
            {
              id: 'NYC1', 
              desiredReplicationCount: 2
            }
          ]
        }
      }
      
      formData.append('pinataOptions', JSON.stringify(pinataOptions))

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${PINATA_JWT}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
      }
    } catch (error) {
      console.error('Pinata upload error:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message
      }
    }
  },

  // Upload JSON data to IPFS
  async uploadJSON(jsonData, metadata = {}) {
    try {
      const pinataMetadata = {
        name: metadata.name || 'incident-data',
        keyvalues: {
          type: metadata.type || 'incident-card',
          timestamp: metadata.timestamp || new Date().toISOString(),
          userId: metadata.userId || 'anonymous',
          ...metadata.customData
        }
      }

      const pinataOptions = {
        cidVersion: 1,
        customPinPolicy: {
          regions: [
            {
              id: 'FRA1',
              desiredReplicationCount: 2
            },
            {
              id: 'NYC1',
              desiredReplicationCount: 2
            }
          ]
        }
      }

      const response = await pinataApi.post('/pinning/pinJSONToIPFS', {
        pinataContent: jsonData,
        pinataMetadata,
        pinataOptions
      })

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
      }
    } catch (error) {
      console.error('Pinata JSON upload error:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message
      }
    }
  },

  // Get file from IPFS
  async getFile(ipfsHash) {
    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Pinata get file error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // List pinned files
  async listFiles(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.pageLimit) params.append('pageLimit', filters.pageLimit)
      if (filters.pageOffset) params.append('pageOffset', filters.pageOffset)
      if (filters.metadata) {
        Object.entries(filters.metadata).forEach(([key, value]) => {
          params.append(`metadata[keyvalues][${key}][value]`, value)
          params.append(`metadata[keyvalues][${key}][op]`, 'eq')
        })
      }

      const response = await pinataApi.get(`/data/pinList?${params}`)
      
      return {
        success: true,
        files: response.data.rows,
        count: response.data.count
      }
    } catch (error) {
      console.error('Pinata list files error:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message
      }
    }
  },

  // Unpin file from IPFS
  async unpinFile(ipfsHash) {
    try {
      await pinataApi.delete(`/pinning/unpin/${ipfsHash}`)
      
      return {
        success: true,
        message: 'File unpinned successfully'
      }
    } catch (error) {
      console.error('Pinata unpin error:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message
      }
    }
  },

  // Generate shareable link for incident card
  generateShareableLink(ipfsHash, type = 'incident-card') {
    const baseUrl = window.location.origin
    return `${baseUrl}/shared/${type}/${ipfsHash}`
  },

  // Test Pinata connection
  async testConnection() {
    try {
      const response = await pinataApi.get('/data/testAuthentication')
      return {
        success: true,
        message: response.data.message
      }
    } catch (error) {
      console.error('Pinata connection test failed:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message
      }
    }
  }
}
