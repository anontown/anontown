FROM ubuntu:18.04 as builder

ENV HOME=/home/app

SHELL ["/bin/bash", "-cl"]

RUN apt update &&\
  apt -y install curl zip unzip &&\
  curl -s "https://get.sdkman.io" | bash&&\
  echo "source ~/.sdkman/bin/sdkman-init.sh" >> $HOME/.bash_profile


RUN sdk install java &&\
  sdk install scala &&\
  sdk install sbt

WORKDIR $HOME

COPY project/build.properties $HOME/project/
RUN sbt update
COPY project/plugins.sbt $HOME/project/
COPY .scalafmt.conf build.sbt $HOME/
RUN sbt update
COPY src $HOME/src
RUN sbt assembly

COPY docker-entrypoint.sh docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]

FROM openjdk:11

ENV HOME=/home/app
WORKDIR $HOME

COPY --from=builder $HOME/target/scala-2.13/app.jar .

CMD java -jar app.jar
