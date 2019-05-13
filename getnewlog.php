<html>
<head>
<meta charset=UTF-8>
</head>
<body>
<?php

$cnt = 0;
$addlog = "";

// mysqliクラスのオブジェクトを作成
$mysqli = new mysqli('127.0.0.1', 'mobajinro', '2SFMz5zE', 'mobajinro');
if ($mysqli->connect_error) {
    echo $mysqli->connect_error;
    exit();
} else {
    $mysqli->set_charset("utf8");
}

$sql = "SELECT MAX(vno) AS vno_newest FROM village";

if ($result = $mysqli -> query($sql)) {
	while($row = $result->fetch_assoc()) {
		$vno_newest = $row["vno_newest"];
	}
}

echo "最新の登録済みログは{$vno_newest}番地です(o・▽・o)<br>\n";
echo "最近のログを何件か表示します……<br><br>\n\n";

// かころぐしゅとく
$html = file_get_contents("http://jinrou.dip.jp/~jinrou/cgi_jinro.cgi?log");
$html = mb_convert_encoding($html,"UTF-8", "sjis-win" );

preg_match_all("/(......)番 (【モバマス】[^<]+村)<\/a>/",$html,$vils);

foreach($vils[1] as $k => $v) {
	if($v > $vno_newest){
		if (!$cnt) echo "<br>ここから下は新しいログみたいです(o・▽・o)<br><br>\n";
		$cnt++;
		$addlog .= $v . " ";
	}
	echo $vils[0][$k]."<br/>\n";
}

echo "<br>";

$addlog = trim($addlog);

if ($cnt) {
	echo "これらのログを登録する場合は送信ボタンを押してねー(o・▽・o)<br>\n戦績DBは一本化されました(o・▽・o)<br>\n";
	echo "<form action='addnewlog.php'target='_blank' method='get'><input type='hidden' value='{$addlog}' name='vlist'>登録→<input type='submit'></form>";
} else {
	echo "新しいログはないっぽいです(o・▽・o)<br>\n";
}
?>
</body>
</html>