package com.anontown;

import java.util.regex.Pattern;

object Constant {
  object User {
    val snRegex: RegexValidator = RegexValidator(
      Pattern.compile("[a-zA-Z0-9_]{3,20}"),
      "スクリーンネームは半角英数字、アンダーバー3～20文字にして下さい"
    );

    val sn: StructureValidator =
      StructureValidator(
        List(CharType.Lc(), CharType.Uc(), CharType.D(), CharType.Ub()),
        Some(3),
        Some(20)
      );

    val passRegex: RegexValidator = RegexValidator(
      Pattern.compile("[a-zA-Z0-9_]{3,50}"),
      "パスワードは半角英数字、アンダーバー3～50文字にして下さい"
    );

    val pass: StructureValidator =
      StructureValidator(
        List(CharType.Lc(), CharType.Uc(), CharType.D(), CharType.Ub()),
        Some(3),
        Some(50)
      );

    val lvMax: Int = 1000;
  }

  object Profile {
    val nameRegex: RegexValidator = RegexValidator(
      Pattern.compile(".{1,50}"),
      "名前は1～50文字にして下さい"
    );

    val name: StructureValidator =
      StructureValidator(
        List(CharType.NotNewLine()),
        Some(1),
        Some(50)
      );

    val snRegex: RegexValidator = RegexValidator(
      Pattern.compile("[a-zA-Z0-9_]{3,20}"),
      "スクリーンネームは半角英数字、アンダーバー3～20文字にして下さい"
    );

    val sn: StructureValidator =
      StructureValidator(
        List(CharType.Lc(), CharType.Uc(), CharType.D(), CharType.Ub()),
        Some(3),
        Some(20)
      );

    val textRegex: RegexValidator = RegexValidator(
      Pattern.compile("[\\s\\S]{1,3000}"),
      "自己紹介文は1～3000文字にして下さい"
    );

    val text: StructureValidator =
      StructureValidator(
        List(CharType.All()),
        Some(1),
        Some(3000)
      );
  }

  object Token {
    val nameRegex: RegexValidator = RegexValidator(
      Pattern.compile("[\\S]{1,50}"),
      "名前は1～50文字にして下さい"
    );

    val name: StructureValidator = StructureValidator(
      List(CharType.NotNewLine()),
      Some(1),
      Some(50)
    );

    val reqExpireMinute: Int = 5;
  }

  object Storage {
    val keyRegex: RegexValidator =
      RegexValidator(
        Pattern.compile("[\\s\\S]{1,100}"),
        "ストレージキーは1～100文字にして下さい"
      );

    val key: StructureValidator = StructureValidator(
      List(CharType.All()),
      Some(1),
      Some(100)
    );

    val valueRegex: RegexValidator =
      RegexValidator(
        Pattern.compile("[\\s\\S]{0,100000}"),
        "ストレージの値は0～100000文字にして下さい"
      );

    val value: StructureValidator = StructureValidator(
      List(CharType.All()),
      Some(0),
      Some(100000)
    );
  }

  object Client {
    val nameRegex: RegexValidator =
      RegexValidator(
        Pattern.compile("[\\S]{1,30}"),
        "名前は1～30文字にして下さい"
      );

    val name: StructureValidator = StructureValidator(
      List(CharType.NotNewLine()),
      Some(1),
      Some(30)
    );

    val urlRegex: RegexValidator =
      RegexValidator(
        Pattern.compile("https?:\\/\\/.{1,500}"),
        "URLが不正です"
      );
  }

  object Topic {
    val titleRegex: RegexValidator =
      RegexValidator(
        Pattern.compile("[\\S]{1,100}"),
        "タイトルは1～100文字にして下さい"
      );

    val title: StructureValidator = StructureValidator(
      List(CharType.NotNewLine()),
      Some(1),
      Some(100)
    );

    val tagRegex: RegexValidator =
      RegexValidator(
        Pattern.compile("[a-z0-9ぁ-んァ-ヶー一-龠々_]{1,20}"),
        "タグは半角小文字英数字ひらがな漢字、アンダーバー1～20文字15個以内にして下さい"
      );

    val tag: StructureValidator = StructureValidator(
      List(
        CharType.Lc(),
        CharType.D(),
        CharType.Hira(),
        CharType.Kana(),
        CharType.Han(),
        CharType.Ub()
      ),
      Some(1),
      Some(20)
    );

    val tagMax: Int = 15;

    val textRegex: RegexValidator =
      RegexValidator(
        Pattern.compile("[\\S\\s]{1,10000}"),
        "本文は1～1万文字以内にして下さい"
      );

    val text: StructureValidator = StructureValidator(
      List(CharType.All()),
      Some(1),
      Some(10000)
    );

    val hashLen: Int = 6;
  }

  object Res {
    val nameRegex: RegexValidator =
      RegexValidator(
        Pattern.compile("[\\S]{1,50}"),
        "名前は50文字以内にして下さい"
      );

    val name: StructureValidator = StructureValidator(
      List(CharType.NotNewLine()),
      Some(1),
      Some(50)
    );

    val textRegex: RegexValidator =
      RegexValidator(
        Pattern.compile("[\\S\\s]{1,5000}"),
        "本文は1～5000文字にして下さい"
      );

    val text: StructureValidator = StructureValidator(
      List(CharType.All()),
      Some(1),
      Some(5000)
    );

    object Wait {
      val maxLv: Int = 3;
      val minSecond: Int = 7;
      val m10: Int = 10;
      val m30: Int = 15;
      val h1: Int = 20;
      val h6: Int = 30;
      val h12: Int = 40;
      val d1: Int = 50;
    }
  }
}
