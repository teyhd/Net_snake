<?php
$login = $_GET["email"];
$pass = $_GET["pass"];
$json_login=array(
    'pass' => 'non',
    'admin' => 0,
    'body' => '1',
    'head' => '1',
    'login' => 'name'
);
$mysqli = new mysqli('localhost', 'teyhd', '258000', 'snake');
/* Проверка соединения */ 
if (mysqli_connect_errno()) { 
    printf("Подключение невозможно: %s\n", mysqli_connect_error()); 
    exit(); 
}  

if ($stmt = $mysqli->prepare("SELECT `password`,`admin`,`color_body`,`color_head` FROM `snake` WHERE `name`='$login'")) { 
    $stmt->execute(); 
    $stmt->bind_result($col1,$col2,$col3,$col4); 
    while ($stmt->fetch()) { 
        $json_login['pass'] = $col1;
        $json_login['admin'] = $col2;
        $json_login['body'] = $col3;
        $json_login['head'] = $col4;
    } 
    $stmt->close(); 
    if ($pass == $json_login['pass']){
        $json_login['login'] = $login;
        $json = json_encode($json_login);
        echo $json;
     }  
     else{ 
        if ($json_login['pass']=='non'){
          
            if ($stmt = $mysqli->prepare("SELECT max(id) FROM snake WHERE id")) { 
                $stmt->execute(); 
                $stmt->bind_result($col1); 
                while ($stmt->fetch()) { 
                    $id = $col1+1;
                } 
                $stmt->close(); 
            }
        
            $body="blue";
            $head="red";
            $admin=0;
            $stmt = $mysqli->prepare("INSERT INTO snake VALUES (?, ?, ?, ?, ?, ?)"); 
            $stmt->bind_param('dssdss', $id,$login,$pass,$admin,$body,$head); 
            $stmt->execute(); 
            $stmt->close(); 
            $json_login['pass'] = $pass;
            $json_login['admin'] = $admin;
            $json_login['body'] = $body;
            $json_login['head'] = $head;
            $json_login['login'] = $login;
            $json = json_encode($json_login);
            echo $json;

        }
        else echo json_encode("nonvalid");;
     }

     

} 

$mysqli->close(); 


?>