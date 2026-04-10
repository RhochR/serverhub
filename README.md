# serverhub
A dashboard for accessing all your selfhosted servers quickly.

![Screenshot](https://raw.githubusercontent.com/RhochR/serverhub/refs/heads/main/screenshots/Screenshot_20260410_101804.png)

## Quick start guide
All you need to do is run:
```bash
docker run -p 5000:5000 -v /your/host/path:/data ghcr.io/rhochr/serverhub:latest
```
Replace /your/host/path with where you want to store the data.
There are three channels to container releases:
- :dev
   The latest development commits, likely very buggy
- :edge
   The latest pre-release
- :latest
   The latest version
- You can alway specify a specific release (e.g. :v0.2-alpha)
