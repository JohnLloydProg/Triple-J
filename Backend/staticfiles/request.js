const myRequest = {
    baseURL : window.location.origin + "/",
    refreshAccess : async function() {
        refreshResponse = await fetch(this.baseURL + 'api/account/token/refresh', {
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
            },
            body : JSON.stringify({
                "refresh": localStorage.getItem('refreshToken')
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error("Response was not ok!")
            }
            return response.json()
        })
        
        return refreshResponse['access']
    },
    get : async function(sub_url) {
        try {
            responseData = await fetch(this.baseURL + sub_url, {
                method : "GET",
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${localStorage.getItem('accessToken')}`,
                },
                credentials : 'same-origin'
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Request was not ok!')
                }
                return response.json()
            })
            return responseData
        }catch(err) {
            try {
                accessToken = await this.refreshAccess()
                localStorage.setItem('accessToken', accessToken)
                return this.get(sub_url)
            }catch(err1) {
                throw new Error('Refresh token is expired or invalid!')
            }
        }
    },
    post : async function(sub_url, _body) {
        try {
            responseData = await fetch(this.baseURL + sub_url, {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body : _body,
                credentials : 'same-origin'
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Request was not ok!')
                }
                return response.json()
            })
            return responseData
        }catch(err) {
            try {
                accessToken = await this.refreshAccess()
                localStorage.setItem('accessToken', accessToken)
                return this.post(sub_url, _body)
            }catch(err1) {
                throw new Error('Refresh token is expired or invalid!')
            }
        }
    }
}