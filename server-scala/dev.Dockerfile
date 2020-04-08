FROM openjdk:11

ENV HOME=/home/app
WORKDIR $HOME

CMD java -jar target/scala-2.13/app.jar
