<?php
  $result = array();
  for ($i = 0; $i < 5; ++$i) {
    $title = '';
    for ($j = 0; $j < mt_rand(10,15); ++$j)
      $title .= chr(mt_rand(ord('a'),ord('z')));
    $result[] = array(
        '_' => uniqid(),
        'title' => $title,
        'timestamp' => mktime()
    );
  }
  echo json_encode($result);
?>