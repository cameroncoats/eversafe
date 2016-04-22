status = '"away'
pin=4
id = node.chipid()
gpio.mode(pin,gpio.OUTPUT)
wifi.sta.config("Cameron's iPhone","isles6464")
tmr.alarm(1,5000,1,function()
pwr = adc.read(0)
sk=net.createConnection(net.TCP, 0)
sk:on("receive", function(sck, c) status = string.match(c, '\"....') end )
sk:connect(80,"77.95.37.3")
sk:send("GET /apiv1/status/"..id.."/"..pwr.." HTTP/1.1\r\nHost: eversafe.decision.hosting\r\nConnection: keep-alive\r\nAccept: */*\r\n\r\n")
sk:close()
if status~=nil then 
status = string.sub(status,2)
else
print("Status is: "..status)
end
print("status: "..status)
if status=="home" then
gpio.write(pin,gpio.HIGH)
else
gpio.write(pin,gpio.LOW)
end
end)
