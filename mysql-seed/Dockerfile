FROM mysql
COPY create-mysql-db.sql /tmp/create-mysql-db.sql
RUN echo "\n[mysqld] \nbind-address = 0.0.0.0\n" >> /etc/mysql/my.cnf
