FROM mysql
COPY create-mysql-db.sql /tmp/create-mysql-db.sql
RUN echo "\n [mysqld] \n bind-address = 0.0.0.0" >> /etc/mysql/my.cnf
