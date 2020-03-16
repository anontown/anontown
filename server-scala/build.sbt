resolvers += Resolver.sonatypeRepo("releases")
addCompilerPlugin(
  "org.typelevel" %% "kind-projector" % "0.11.0" cross CrossVersion.full
)
addCompilerPlugin("com.olegpy" %% "better-monadic-for" % "0.3.1")

val scalaVersionValue = "2.13.1"

lazy val commonSettings = Seq(
  organization := "net.kgtkr",
  scalaVersion := scalaVersionValue,
  scalacOptions ++= Seq(
    "-language:higherKinds",
    "-Ymacro-annotations"
  ),
  scalacOptions in (Compile, compile) ++= Seq(
    "-Ywarn-unused",
    "-Ywarn-macros:after"
  ),
  wartremoverErrors in (Compile, compile) ++= Warts
    .allBut(
      Wart.Any,
      Wart.Nothing,
      Wart.DefaultArguments,
      Wart.JavaSerializable,
      Wart.Product,
      Wart.Serializable,
      Wart.PublicInference,
      Wart.ImplicitParameter,
      Wart.ExplicitImplicitTypes,
      Wart.Recursion
    )
)

val zioVersion = "1.0.0-RC14"
val monocleVersion = "2.0.0"

lazy val root = (project in file("."))
  .dependsOn(macros)
  .settings(commonSettings: _*)
  .settings(
    name := "anontown",
    version := "0.1",
    libraryDependencies ++= Seq(
      "org.typelevel" %% "cats-core" % "2.0.0",
      "io.circe" %% "circe-yaml" % "0.11.0-M1",
      "io.circe" %% "circe-core" % "0.12.1",
      "io.circe" %% "circe-generic" % "0.12.1",
      "io.circe" %% "circe-parser" % "0.12.1",
      "org.scalactic" %% "scalactic" % "3.0.8",
      "org.scalatest" %% "scalatest" % "3.0.8" % "test",
      "dev.zio" %% "zio" % zioVersion,
      "dev.zio" %% "zio-streams" % zioVersion,
      "org.typelevel" %% "cats-tagless-macros" % "0.10",
      "org.typelevel" %% "cats-mtl-core" % "0.7.0",
      "org.typelevel" %% "cats-effect" % "2.0.0",
      "org.atnos" %% "eff" % "5.5.2",
      "org.typelevel" %% "kittens" % "2.0.0",
      "org.mongodb.scala" %% "mongo-scala-driver" % "2.7.0",
      "org.typelevel" %% "simulacrum" % "1.0.0",
      "com.github.julien-truffaut" %% "monocle-core" % monocleVersion,
      "com.github.julien-truffaut" %% "monocle-macro" % monocleVersion,
      "com.chuusai" %% "shapeless" % "2.3.3",
      "org.sangria-graphql" %% "sangria" % "2.0.0-M4",
      "org.sangria-graphql" %% "sangria-circe" % "1.3.0",
      "co.fs2" %% "fs2-core" % "2.2.1",
      "co.fs2" %% "fs2-io" % "2.2.1"
    ),
    mainClass in assembly := Some("com.anontown.App"),
    assemblyJarName in assembly := "app.jar"
  )
  .aggregate(macros)

lazy val macros = (project in file("macros"))
  .settings(commonSettings: _*)
  .settings(
    name := "anontown-macros",
    version := "0.1",
    libraryDependencies ++= Seq(
      "org.scala-lang" % "scala-reflect" % scalaVersionValue
    )
  )
