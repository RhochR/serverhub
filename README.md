# serverhub
A dashboard for accessing all your selfhosted servers quickly.

![Screenshot](https://raw.githubusercontent.com/RhochR/serverhub/refs/heads/main/screenshots/Screenshot_20260410_101804.png)

## Quick start guide
### Data persistence

By default, ServerHub stores its data in a named Docker volume managed automatically by Docker.

To store data at a specific location on your host instead, edit the `volumes` section in `docker-compose.yml`:

```yaml
volumes:
  - /your/custom/path:/data
```

To find or back up the default volume:

```bash
docker volume inspect serverhub_data
```
### Run the container
```bash
docker-compose build
```
Then run:
```bash
docker-compose up -d
```
