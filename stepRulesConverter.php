<?php
$content = file_get_contents('php://stdin');
$content = preg_replace('/^\#.*$/m', '', $content);
$content = preg_replace('/\s+/', '', $content);
preg_match_all('/\{\"([^\"]*)\"\,(\d+)\,(\d+)\,\{([^\}]*)\}\,([^\;]+)\}\;/', $content, $steps, PREG_SET_ORDER);
$content = 'var steps = [';
for ($i = 0; $i < count($steps); ++$i) {
	if ($i > 0) $content .= ',';
	$step = $steps[$i];
	$name = $step[1];
	$minWordSize = $step[2];
	$compareEntireWord = $step[3] == '1' ? 'true' : 'false';
	$wordEndings = $step[4];
	$rules = $step[5];
	$content .= "\r\n\t" . '{' . "\r\n";
	$content .= "\t\t" . "name: '" . $name . "'," . "\r\n";
	$content .= "\t\t" . 'minWordSize: ' . $minWordSize . ',' . "\r\n";
	$content .= "\t\t" . 'compareEntireWord: ' . $compareEntireWord . ',' . "\r\n";
	$wordEndings = str_replace('"', "'", $wordEndings);
	$wordEndings = str_replace("','", "', '", $wordEndings);
	$content .= "\t\t" . 'wordEndings: [' . $wordEndings . '],' . "\r\n";
	$content .= "\t\t" . 'rules: [';
	preg_match_all('/\{\"([^\"]*)\"(\,(\d+)(\,\"([^\"]*)\"(\,\{([^\}]*)\})?)?)?\}/', $rules, $rules, PREG_SET_ORDER);
	for ($j = 0; $j < count($rules); ++$j) {
		if ($j > 0) $content .= ',';
		$rule = $rules[$j];
		$suffix = $rule[1];
		$content .= "\r\n\t\t\t" . '{';
		$content .= "suffix: '{$suffix}'";
		if (count($rule) > 3) {
			$minStemSize = $rule[3];
			$content .= ", minStemSize: {$minStemSize}";
			if (count($rule) > 5) {
				$replacement = $rule[5];
				if ($replacement != '') $content .= ", replacement: '{$replacement}'";
				if (count($rule) > 7) {
					$exceptions = $rule[7];
					$exceptions = str_replace('"', "'", $exceptions);
					$exceptions = str_replace("','", "', '", $exceptions);
					$content .= ', exceptions: [' . $exceptions . ']';
				}
			}
		}
		$content .= '}';
	}
	$content .= "\r\n\t\t" . ']' . "\r\n";
	$content .= "\t" . '}';
}
$content .= "\r\n" . '];';
file_put_contents('php://stdout', $content);
?>