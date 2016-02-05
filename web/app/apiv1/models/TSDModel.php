<?php
class TSDModel extends BaseModel
{
public function addData($chipid,$value){
 $sql = "INSERT INTO `tblTSDB` (`tsTime`,`tsData`,`tsChipID`) VALUES (CURRENT_TIMESTAMP,:data,:chip)";
 $sth = $this->_db->prepare($sql);
 $sth -> bindParam(":data",$value,PDO::PARAM_FLOAT);
 $sth -> bindParam(":chip",$chipid,PDO::PARAM_FLOAT);
 $sth -> execute();
}

}