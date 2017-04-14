useradd -s /bin/bash -m -d /home/deploy -c “deploy” deploy
passwd -d deploy
usermod -aG sudo deploy
