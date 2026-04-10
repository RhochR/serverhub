# serverhub
A dashboard for accessing all your selfhosted servers quickly.

![Screenshot](https://raw.githubusercontent.com/RhochR/serverhub/refs/heads/main/screenshots/Screenshot.png)

## ⚡ Features

* **Material Design 3 Expressive UI**
* **Custom Server Categories**
* **Dark/Light-Mode**
* **Easy Setup**
* **Fast deployment**

## Quick start guide
All you need to do is run:
```bash
docker run -p 5000:5000 -v /your/host/path:/data ghcr.io/rhochr/serverhub:latest
```
Replace /your/host/path with where you want to store the data.
There are three channels to container releases:
- :edge
   The latest pre-release
- :latest
   The latest version
- You can alway specify a specific release (e.g. :v0.2-alpha)

### Docker-Compose
You can either download the source code and use the existing docker-compose.yml, which builds everything from scratch (make sure to set a volume for the data path!)

Or you can use this docker-compose file, it does not need the source code (also adjust the data path):
```yaml
services:
  serverhub:
    image: ghcr.io/rhochr/serverhub:latest
    container_name: serverhub
    ports:
      - "5000:5000"
    volumes:
      - ./path/to/data/on/your/machine:/data
    restart: unless-stopped
```
